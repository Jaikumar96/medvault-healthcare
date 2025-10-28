package com.medvault.medvault.controller;

import com.medvault.medvault.dto.AppointmentDetailDTO;
import com.medvault.medvault.dto.DoctorProfileRequest;
import com.medvault.medvault.dto.FeedbackDTO;
import com.medvault.medvault.dto.TimeSlotRequest;
import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.*;
import com.medvault.medvault.service.AppointmentStatusService;
import com.medvault.medvault.service.EmailService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import com.medvault.medvault.model.Feedback;
import com.medvault.medvault.repository.FeedbackRepository;
import com.medvault.medvault.dto.FeedbackDTO;

import com.medvault.medvault.model.MedicalRecord;
import com.medvault.medvault.model.RecordPermission;
import com.medvault.medvault.repository.MedicalRecordRepository;
import com.medvault.medvault.repository.RecordPermissionRepository;


@RestController
@RequestMapping("/api/doctor")

public class DoctorController {
    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);
    private static final String UPLOAD_DIR = "uploads/doctor-documents/";
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TimeSlotRepository timeSlotRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AppointmentStatusService appointmentStatusService;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private RecordPermissionRepository recordPermissionRepository;



    @PostConstruct
    public void init() {
        try {
            String uploadDirPath = System.getProperty("user.dir") + File.separator + UPLOAD_DIR;
            Path uploadPath = Paths.get(uploadDirPath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory: " + uploadPath.toAbsolutePath());
            } else {
                logger.info("Upload directory exists: " + uploadPath.toAbsolutePath());
            }
        } catch (Exception e) {
            logger.error("Failed to create upload directory", e);
        }
    }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> createOrUpdateProfile(@PathVariable Long userId,
                                                                     @RequestBody DoctorProfileRequest request) {
        try {
            // Check if user exists and is a doctor
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getRole() != Role.DOCTOR) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid doctor user"));
            }
            Optional<Doctor> existingDoctor = doctorRepository.findByUserId(userId);
            Doctor doctor;
            if (existingDoctor.isPresent()) {
                // Update existing profile
                doctor = existingDoctor.get();
            } else {
                // Create new doctor profile
                doctor = new Doctor();
                doctor.setUserId(userId);
                doctor.setStatus(DoctorStatus.INACTIVE); // Start with INACTIVE
                doctor.setDocumentsUploaded(false);
                doctor.setProfileComplete(false);
            }
            // Update profile data
            doctor.setFirstName(request.getFirstName());
            doctor.setLastName(request.getLastName());
            doctor.setGender(request.getGender());
            doctor.setDateOfBirth(request.getDateOfBirth());
            doctor.setContactNumber(request.getContactNumber());
            doctor.setEmail(request.getEmail());
            doctor.setAddress(request.getAddress());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setYearsOfExperience(request.getYearsOfExperience());
            doctor.setConsultationFees(request.getConsultationFees());
            doctor.setLanguagesSpoken(request.getLanguagesSpoken());
            doctor.setProfileComplete(true);
            // Keep status as INACTIVE until documents are uploaded
            if (doctor.getStatus() == null || doctor.getStatus() == DoctorStatus.INACTIVE) {
                doctor.setStatus(DoctorStatus.INACTIVE);
            }
            Doctor savedDoctor = doctorRepository.save(doctor);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile saved successfully");
            response.put("doctor", savedDoctor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error saving doctor profile: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        try {
            logger.info("Fetching profile for user: {}", userId);

            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();

                // ✅ CRITICAL FIX: Check document paths exist
                boolean documentsActuallyUploaded = doctor.hasAllRequiredDocuments();

                // ✅ If status is APPROVED but documents are missing, fix the data
                if (doctor.getStatus() == DoctorStatus.APPROVED && !documentsActuallyUploaded) {
                    logger.warn("Doctor {} is APPROVED but missing documents. Correcting documentsUploaded flag.", userId);
                    doctor.setDocumentsUploaded(false);
                    doctorRepository.save(doctor);
                } else if (documentsActuallyUploaded && !Boolean.TRUE.equals(doctor.getDocumentsUploaded())) {
                    logger.info("Doctor {} has all documents but flag is false. Correcting flag.", userId);
                    doctor.setDocumentsUploaded(true);
                    doctorRepository.save(doctor);
                }

                Map<String, Object> response = createSafeDoctorResponse(doctor);
                logger.info("Profile response for user {}: status={}, profileComplete={}, documentsUploaded={}",
                        userId, doctor.getStatus(), doctor.getProfileComplete(), doctor.getDocumentsUploaded());

                return ResponseEntity.ok(response);
            } else {
                // Return empty doctor object for new profiles
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("userId", userId);
                emptyResponse.put("status", "INACTIVE");
                emptyResponse.put("profileComplete", false);
                emptyResponse.put("documentsUploaded", false);
                emptyResponse.put("hasAllDocuments", false);
                emptyResponse.put("isFullyVerified", false);
                return ResponseEntity.ok(emptyResponse);
            }
        } catch (Exception e) {
            logger.error("Error fetching doctor profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }



    @PostMapping("/upload-documents/{userId}")
    public ResponseEntity<Map<String, Object>> uploadDocuments(@PathVariable Long userId,
                                                               @RequestParam("medicalDegree") MultipartFile medicalDegree,
                                                               @RequestParam("medicalLicense") String medicalLicense,
                                                               @RequestParam("governmentId") MultipartFile governmentId,
                                                               @RequestParam(value = "clinicAffiliation", required = false) MultipartFile clinicAffiliation) {
        try {
            logger.info("Starting document upload for user: {}", userId);

            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                logger.error("Doctor not found for user: {}", userId);
                return ResponseEntity.badRequest().body(Map.of("error", "Doctor profile not found. Please create your profile first."));
            }

            Doctor doctor = doctorOpt.get();

            if (!Boolean.TRUE.equals(doctor.getProfileComplete())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please complete basic profile information first"));
            }

            // Create upload directory
            String uploadDirPath = System.getProperty("user.dir") + File.separator + UPLOAD_DIR;
            Path uploadPath = Paths.get(uploadDirPath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Track upload success
            boolean allUploaded = true;
            StringBuilder uploadLog = new StringBuilder();

            // Save medical degree certificate
            if (!medicalDegree.isEmpty()) {
                try {
                    String medicalDegreeFileName = userId + "_medical_degree_" + System.currentTimeMillis() + "_" + medicalDegree.getOriginalFilename();
                    Path medicalDegreePath = uploadPath.resolve(medicalDegreeFileName);
                    Files.write(medicalDegreePath, medicalDegree.getBytes());
                    doctor.setMedicalDegreeCertificate(medicalDegreePath.toString());
                    uploadLog.append("Medical degree uploaded successfully. ");
                    logger.info("Saved medical degree: {}", medicalDegreePath.toString());
                } catch (Exception e) {
                    logger.error("Failed to upload medical degree: {}", e.getMessage());
                    allUploaded = false;
                }
            } else {
                logger.warn("Medical degree file is empty");
                allUploaded = false;
            }

            // Save medical license number
            if (medicalLicense != null && !medicalLicense.trim().isEmpty()) {
                doctor.setMedicalLicenseNumber(medicalLicense.trim());
                uploadLog.append("Medical license saved. ");
                logger.info("Saved medical license: {}", medicalLicense);
            } else {
                logger.warn("Medical license is empty");
                allUploaded = false;
            }

            // Save government ID
            if (!governmentId.isEmpty()) {
                try {
                    String govIdFileName = userId + "_gov_id_" + System.currentTimeMillis() + "_" + governmentId.getOriginalFilename();
                    Path govIdPath = uploadPath.resolve(govIdFileName);
                    Files.write(govIdPath, governmentId.getBytes());
                    doctor.setGovernmentIdPath(govIdPath.toString());
                    uploadLog.append("Government ID uploaded successfully. ");
                    logger.info("Saved government ID: {}", govIdPath.toString());
                } catch (Exception e) {
                    logger.error("Failed to upload government ID: {}", e.getMessage());
                    allUploaded = false;
                }
            } else {
                logger.warn("Government ID file is empty");
                allUploaded = false;
            }

            // Save clinic affiliation (optional)
            if (clinicAffiliation != null && !clinicAffiliation.isEmpty()) {
                try {
                    String clinicFileName = userId + "_clinic_" + System.currentTimeMillis() + "_" + clinicAffiliation.getOriginalFilename();
                    Path clinicPath = uploadPath.resolve(clinicFileName);
                    Files.write(clinicPath, clinicAffiliation.getBytes());
                    doctor.setClinicAffiliationPath(clinicPath.toString());
                    uploadLog.append("Clinic affiliation uploaded successfully. ");
                    logger.info("Saved clinic affiliation: {}", clinicPath.toString());
                } catch (Exception e) {
                    logger.error("Failed to upload clinic affiliation: {}", e.getMessage());
                    // Don't fail for optional document
                }
            }

            // ✅ CRITICAL FIX: Update status based on upload success
            if (allUploaded && doctor.hasAllRequiredDocuments()) {
                doctor.setDocumentsUploaded(true);
                doctor.setStatus(DoctorStatus.PENDING);
                logger.info("All documents uploaded successfully for user: {}", userId);
            } else {
                doctor.setDocumentsUploaded(false);
                logger.warn("Some documents failed to upload for user: {}", userId);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Some documents failed to upload. Please try again.",
                        "details", uploadLog.toString()
                ));
            }

            Doctor savedDoctor = doctorRepository.save(doctor);
            logger.info("Updated doctor status to PENDING for user: {}", userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Documents uploaded successfully. Awaiting admin approval.");
            response.put("doctor", createSafeDoctorResponse(savedDoctor));
            response.put("uploadDetails", uploadLog.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("IO Error uploading documents: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error processing document upload: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Upload processing failed: " + e.getMessage()));
        }
    }

    // Helper method to create safe response
    private Map<String, Object> createSafeDoctorResponse(Doctor doctor) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", doctor.getId());
        response.put("userId", doctor.getUserId());
        response.put("firstName", doctor.getFirstName());
        response.put("lastName", doctor.getLastName());
        response.put("email", doctor.getEmail());
        response.put("specialization", doctor.getSpecialization());
        response.put("status", doctor.getStatus().toString());
        response.put("profileComplete", Boolean.TRUE.equals(doctor.getProfileComplete()));
        response.put("documentsUploaded", Boolean.TRUE.equals(doctor.getDocumentsUploaded()));
        response.put("consultationFees", doctor.getConsultationFees());
        response.put("yearsOfExperience", doctor.getYearsOfExperience());
        response.put("contactNumber", doctor.getContactNumber());
        response.put("hasAllDocuments", doctor.hasAllRequiredDocuments());
        response.put("isFullyVerified", doctor.isFullyVerified());
        return response;
    }


    @PostMapping("/slots/{userId}")
    public ResponseEntity<Map<String, Object>> createTimeSlot(@PathVariable Long userId, @RequestBody TimeSlotRequest request) {
        try {
            Doctor doctor = doctorRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with user ID: " + userId));

            if (doctor.getStatus() != DoctorStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Your profile must be approved to create slots."));
            }

            List<TimeSlot> slotsToSave = new ArrayList<>();

            if (Boolean.TRUE.equals(request.getIsRecurring()) && request.getRecurringDays() != null && !request.getRecurringDays().isEmpty()) {
                // --- Handle Recurring Slots ---
                LocalDate startDate = request.getStartTime().toLocalDate();
                LocalDate endDate = LocalDate.parse(request.getRecurringEndDate());
                LocalTime time = request.getStartTime().toLocalTime();

                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    String currentDayOfWeek = date.getDayOfWeek().toString(); // e.g., "MONDAY"

                    if (request.getRecurringDays().contains(currentDayOfWeek)) {
                        TimeSlot slot = new TimeSlot();
                        slot.setDoctorId(doctor.getId());
                        slot.setStartTime(date.atTime(time));
                        slot.setEndTime(date.atTime(time).plusMinutes(request.getDuration()));
                        slot.setIsAvailable(true);
                        slot.setDuration(request.getDuration());
                        slot.setAppointmentType(request.getAppointmentType());
                        slot.setBufferTime(request.getBufferTime());
                        slotsToSave.add(slot);
                    }
                }
                if (slotsToSave.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No valid dates found for the selected recurring days in the given date range."));
                }
                timeSlotRepository.saveAll(slotsToSave);
                return ResponseEntity.ok(Map.of("message", slotsToSave.size() + " recurring time slots created successfully."));

            } else {
                // --- Handle Single Slot ---
                TimeSlot slot = new TimeSlot();
                slot.setDoctorId(doctor.getId());
                slot.setStartTime(request.getStartTime());
                slot.setEndTime(request.getEndTime());
                slot.setIsAvailable(true);
                slot.setDuration(request.getDuration());
                slot.setAppointmentType(request.getAppointmentType());
                slot.setBufferTime(request.getBufferTime());

                timeSlotRepository.save(slot);
                return ResponseEntity.ok(Map.of("message", "Time slot created successfully."));
            }

        } catch (Exception e) {
            logger.error("Error creating time slot: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "An internal server error occurred while creating slots."));
        }
    }

    @GetMapping("/slots/{userId}")
    public ResponseEntity<List<TimeSlot>> getTimeSlots(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<TimeSlot> slots = timeSlotRepository.findByDoctorId(doctorOpt.get().getId());
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            logger.error("Error fetching time slots: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/appointments/{userId}")
    public ResponseEntity<List<AppointmentDetailDTO>> getAppointments(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<Appointment> appointments = appointmentRepository.findByDoctorOrderByCreatedAtDesc(doctorOpt.get());
            // Convert to DTO
            List<AppointmentDetailDTO> dtos = appointments.stream()
                    .map(this::convertAppointmentToDetailDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching appointments for doctor: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    private AppointmentDetailDTO convertAppointmentToDetailDTO(Appointment appointment) {
        AppointmentDetailDTO dto = new AppointmentDetailDTO();
        dto.setId(appointment.getId());
        dto.setStatus(appointment.getStatus());
        dto.setPatientNotes(appointment.getPatientNotes());
        dto.setRejectionReason(appointment.getRejectionReason());
        dto.setCreatedAt(appointment.getCreatedAt());

        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getUserId());
            dto.setPatientFirstName(appointment.getPatient().getFirstName());
            dto.setPatientLastName(appointment.getPatient().getLastName());

            // ADD THIS: Create nested patient object for frontend compatibility
            Map<String, String> patientObj = new HashMap<>();
            patientObj.put("firstName", appointment.getPatient().getFirstName());
            patientObj.put("lastName", appointment.getPatient().getLastName());
            dto.setPatient(patientObj); // You'll need to add this field to AppointmentDetailDTO
        }

        if (appointment.getSlotId() != null) {
            dto.setSlotId(appointment.getSlotId());
            timeSlotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                dto.setAppointmentStartTime(slot.getStartTime());
                dto.setAppointmentEndTime(slot.getEndTime());
            });
        }
        return dto;
    }


    @GetMapping("/dashboard-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            LocalDate today = LocalDate.now();
            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.atTime(23, 59, 59);

            // Get today's appointments
            long todayAppointments = 0;
            try {
                List<Appointment> todayAppts = appointmentRepository.findByDoctorAndStatus(doctor, AppointmentStatus.APPROVED);
                for (Appointment apt : todayAppts) {
                    if (apt.getSlotId() != null) {
                        Optional<TimeSlot> slotOpt = timeSlotRepository.findById(apt.getSlotId());
                        if (slotOpt.isPresent()) {
                            LocalDateTime slotTime = slotOpt.get().getStartTime();
                            if (slotTime.isAfter(startOfDay) && slotTime.isBefore(endOfDay)) {
                                todayAppointments++;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error calculating today's appointments: {}", e.getMessage());
            }

            // Get total patients
            long totalPatients = 0;
            try {
                List<Patient> patients = appointmentRepository.findDistinctPatientsByDoctor(doctor);
                totalPatients = patients.size();
            } catch (Exception e) {
                logger.error("Error calculating total patients: {}", e.getMessage());
            }

            // Get pending reviews
            long pendingReviews = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.PENDING);

            // Calculate monthly earnings
            double monthlyEarnings = 0.0;
            try {
                long completedAppointments = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.COMPLETED);
                monthlyEarnings = completedAppointments * (doctor.getConsultationFees() != null ? doctor.getConsultationFees() : 500.0);
            } catch (Exception e) {
                logger.error("Error calculating monthly earnings: {}", e.getMessage());
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("todayAppointments", todayAppointments);
            stats.put("totalPatients", totalPatients);
            stats.put("pendingReviews", pendingReviews);
            stats.put("monthlyEarnings", monthlyEarnings);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.error("Error fetching dashboard stats for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch dashboard stats"));
        }
    }



    @GetMapping("/my-patients/{userId}")
    public ResponseEntity<List<Patient>> getMyPatients(@PathVariable Long userId) {
        Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Patient> patients = appointmentRepository.findDistinctPatientsByDoctor(doctorOpt.get());
        return ResponseEntity.ok(patients);
    }

    @PostMapping("/appointments/{appointmentId}/approve")
    public ResponseEntity<Map<String, Object>> approveAppointment(@PathVariable Long appointmentId) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) return ResponseEntity.notFound().build();
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(AppointmentStatus.APPROVED);
            appointmentRepository.save(appointment);
            timeSlotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                slot.setIsAvailable(false);
                timeSlotRepository.save(slot);
                // Send confirmation email to patient
                emailService.sendAppointmentConfirmationToPatient(
                        appointment.getPatient().getEmail(),
                        appointment.getPatient().getFirstName(),
                        appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName(),
                        slot.getStartTime()
                );
            });
            return ResponseEntity.ok(Map.of("message", "Appointment approved successfully"));
        } catch (Exception e) {
            logger.error("Error approving appointment {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to approve appointment."));
        }
    }

    @PostMapping("/appointments/{appointmentId}/reject")
    public ResponseEntity<Map<String, Object>> rejectAppointment(@PathVariable Long appointmentId, @RequestBody Map<String, String> requestBody) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Appointment appointment = appointmentOpt.get();
            String reason = requestBody.get("reason");
            appointment.setStatus(AppointmentStatus.REJECTED);
            appointment.setRejectionReason(reason);
            appointmentRepository.save(appointment);

            // ✨ FIX: Fetch the time slot to get the appointment time for the email
            timeSlotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                emailService.sendAppointmentRejectionToPatient(
                        appointment.getPatient().getEmail(),
                        appointment.getPatient().getFirstName(),
                        appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName(),
                        slot.getStartTime(), // <-- Pass the LocalDateTime here
                        reason // <-- Pass the reason string as the last argument
                );
            });

            return ResponseEntity.ok(Map.of("message", "Appointment rejected successfully"));
        } catch (Exception e) {
            logger.error("Error rejecting appointment {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reject appointment."));
        }
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Map<String, Object>> deleteTimeSlot(@PathVariable Long slotId) {
        try {
            logger.info("Attempting to delete time slot with ID: {}", slotId);

            // Check if the time slot exists
            Optional<TimeSlot> timeSlotOpt = timeSlotRepository.findById(slotId);
            if (timeSlotOpt.isEmpty()) {
                logger.warn("Time slot not found with ID: {}", slotId);
                return ResponseEntity.notFound().build();
            }

            TimeSlot timeSlot = timeSlotOpt.get();

            // Check if the slot is available (not booked)
            if (!timeSlot.getIsAvailable()) {
                logger.warn("Cannot delete booked time slot with ID: {}", slotId);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete a booked time slot"));
            }

            // Check if there are any pending appointments for this slot
            List<Appointment> pendingAppointments = appointmentRepository
                    .findBySlotIdAndStatus(slotId, AppointmentStatus.PENDING);

            if (!pendingAppointments.isEmpty()) {
                logger.warn("Cannot delete time slot {} - has pending appointments", slotId);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete time slot with pending appointments"));
            }

            // Delete the time slot
            timeSlotRepository.delete(timeSlot);
            logger.info("Successfully deleted time slot with ID: {}", slotId);

            return ResponseEntity.ok(Map.of(
                    "message", "Time slot deleted successfully",
                    "deletedSlotId", slotId
            ));

        } catch (Exception e) {
            logger.error("Error deleting time slot {}: {}", slotId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to delete time slot: " + e.getMessage()));
        }
    }

    @GetMapping("/feedback/{userId}")
    public ResponseEntity<Map<String, Object>> getDoctorFeedback(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            List<Feedback> feedbacks = feedbackRepository.findByDoctorOrderByFeedbackDateDesc(doctor);

            List<FeedbackDTO> feedbackDTOs = feedbacks.stream()
                    .map(this::convertFeedbackToDTO)
                    .collect(Collectors.toList());

            // Calculate statistics
            Double averageRating = feedbackRepository.getAverageRatingByDoctor(doctor);
            Long totalFeedbacks = feedbackRepository.getTotalFeedbackCountByDoctor(doctor);

            // Rating distribution
            Map<Integer, Long> ratingDistribution = feedbacks.stream()
                    .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));

            Map<String, Object> response = new HashMap<>();
            response.put("feedbacks", feedbackDTOs);
            response.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
            response.put("totalFeedbacks", totalFeedbacks);
            response.put("ratingDistribution", ratingDistribution);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching doctor feedback: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    private FeedbackDTO convertFeedbackToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setAppointmentId(feedback.getAppointment().getId());
        dto.setPatientName(feedback.getIsAnonymous() ? "Anonymous" :
                feedback.getPatient().getFirstName() + " " + feedback.getPatient().getLastName());
        dto.setDoctorName("Dr. " + feedback.getDoctor().getFirstName() + " " + feedback.getDoctor().getLastName());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setFeedbackDate(feedback.getFeedbackDate());
        dto.setIsAnonymous(feedback.getIsAnonymous());

        // Get appointment date
        timeSlotRepository.findById(feedback.getAppointment().getSlotId())
                .ifPresent(slot -> dto.setAppointmentDate(slot.getStartTime()));

        return dto;
    }

    @PostMapping("/trigger-completion-check/{userId}")
    public ResponseEntity<Map<String, Object>> triggerCompletionCheck(@PathVariable Long userId) {
        try {
            // Verify doctor exists and is approved (security check)
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty() || doctorOpt.get().getStatus() != DoctorStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            int completedCount = appointmentStatusService.manuallyUpdateCompletedAppointments();

            return ResponseEntity.ok(Map.of(
                    "message", "Completion check triggered successfully",
                    "completedAppointments", completedCount
            ));

        } catch (Exception e) {
            logger.error("Error triggering completion check: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to trigger completion check"));
        }
    }

    @PostMapping("/cleanup-expired-slots/{userId}")
    public ResponseEntity<Map<String, Object>> cleanupExpiredSlots(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            LocalDateTime now = LocalDateTime.now();

            // Find all expired available slots
            List<TimeSlot> expiredSlots = timeSlotRepository.findByDoctorIdAndIsAvailableAndStartTimeBefore(
                    doctor.getId(), true, now);

            if (!expiredSlots.isEmpty()) {
                // Delete expired slots
                timeSlotRepository.deleteAll(expiredSlots);
                logger.info("Cleaned up {} expired time slots for doctor {}", expiredSlots.size(), doctor.getId());

                return ResponseEntity.ok(Map.of(
                        "message", "Expired slots cleaned up successfully",
                        "removedSlotsCount", expiredSlots.size()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "message", "No expired slots found",
                        "removedSlotsCount", 0
                ));
            }

        } catch (Exception e) {
            logger.error("Error cleaning up expired slots for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to cleanup expired slots"));
        }
    }

    @PostMapping("/accept-emergency/{doctorUserId}/{appointmentId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> acceptEmergencyAppointment(@PathVariable Long doctorUserId,
                                                                          @PathVariable Long appointmentId,
                                                                          @RequestBody Map<String, String> requestBody) {
        try {
            // Validate doctor
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(doctorUserId);
            if (doctorOpt.isEmpty() || doctorOpt.get().getStatus() != DoctorStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Doctor not authorized"));
            }

            Doctor doctor = doctorOpt.get();

            // Validate emergency appointment
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty() || !Boolean.TRUE.equals(appointmentOpt.get().getIsEmergency())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Emergency appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            // Check if already accepted by another doctor
            if (appointment.getDoctor() != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Emergency already accepted by another doctor"));
            }

            // Accept the emergency
            appointment.setDoctor(doctor);
            appointment.setStatus(AppointmentStatus.APPROVED);

            String proposedTime = requestBody.get("proposedTime"); // Expected format: "2024-01-20T14:30:00"
            if (proposedTime != null) {
                appointment.setPatientNotes(appointment.getPatientNotes() + " | Proposed Time: " + proposedTime);
            }

            appointmentRepository.save(appointment);

            // Send confirmation to patient
            emailService.sendEmergencyAcceptanceNotification(
                    appointment.getPatient().getEmail(),
                    appointment.getPatient().getFirstName(),
                    doctor.getFirstName() + " " + doctor.getLastName(),
                    doctor.getContactNumber(),
                    proposedTime
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Emergency appointment accepted successfully",
                    "doctorName", doctor.getFirstName() + " " + doctor.getLastName(),
                    "patientName", appointment.getPatient().getFirstName()
            ));

        } catch (Exception e) {
            logger.error("Error accepting emergency: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to accept emergency"));
        }
    }

    @GetMapping("/emergency-requests/{doctorUserId}")
    public ResponseEntity<List<Map<String, Object>>> getEmergencyRequests(@PathVariable Long doctorUserId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(doctorUserId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Appointment> emergencyRequests = appointmentRepository.findByIsEmergencyTrueAndDoctorIsNullAndStatus(AppointmentStatus.PENDING);

            List<Map<String, Object>> result = emergencyRequests.stream().map(appointment -> {
                Map<String, Object> emergencyInfo = new HashMap<>();
                emergencyInfo.put("id", appointment.getId());
                emergencyInfo.put("patientName", appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName());
                emergencyInfo.put("urgencyLevel", appointment.getUrgencyLevel());
                emergencyInfo.put("symptoms", appointment.getPatientNotes());
                emergencyInfo.put("contactNumber", appointment.getPatient().getContactNumber());
                emergencyInfo.put("createdAt", appointment.getCreatedAt());
                return emergencyInfo;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error fetching emergency requests: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }



    // Add these methods to DoctorController class

    // ✅ FIXED: Download Medical Record Method
    @GetMapping("/download-record/{doctorUserId}/{recordId}")
    public ResponseEntity<Resource> downloadMedicalRecord(@PathVariable Long doctorUserId, @PathVariable Long recordId) {
        try {
            // Validate doctor
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(doctorUserId);
            if (doctorOpt.isEmpty()) {
                logger.error("Doctor not found for user ID: {}", doctorUserId);
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            logger.info("Doctor found: {}", doctor.getFirstName());

            // Get the medical record
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (recordOpt.isEmpty()) {
                logger.error("Medical record not found: {}", recordId);
                return ResponseEntity.notFound().build();
            }

            MedicalRecord record = recordOpt.get();
            logger.info("Medical record found: {}", record.getTitle());

            // ✅ FIXED: Use the fixed method that handles duplicates
            Optional<RecordPermission> permission = recordPermissionRepository
                    .findLatestByPatientAndDoctorAndMedicalRecord(record.getPatient(), doctor, record);

            if (permission.isEmpty() || !permission.get().getIsGranted()) {
                logger.error("No permission found or permission denied for doctor {} and record {}", doctorUserId, recordId);
                return ResponseEntity.status(403).build(); // Forbidden
            }

            logger.info("Permission found: {} for doctor: {}", permission.get().getPermissionType(), doctor.getFirstName());

            // Load file as Resource
            Path filePath = Paths.get(record.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Get file extension to determine content type
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                logger.info("Serving file: {} with content type: {}", filePath, contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + record.getTitle() + "\"")
                        .body(resource);
            } else {
                logger.error("File not found or not readable: {}", record.getFilePath());
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            logger.error("Error downloading medical record: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }


    @GetMapping("/accessible-records/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAccessibleRecords(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();

            // Get all permissions granted to this doctor
            List<RecordPermission> permissions = recordPermissionRepository
                    .findByDoctorAndIsGrantedTrue(doctor);

            List<Map<String, Object>> recordDTOs = permissions.stream()
                    .collect(Collectors.toMap(
                            permission -> permission.getMedicalRecord().getId(), // Use record ID as key
                            permission -> {
                                MedicalRecord record = permission.getMedicalRecord();
                                Map<String, Object> dto = new HashMap<>();
                                dto.put("id", record.getId());
                                dto.put("recordType", record.getRecordType());
                                dto.put("title", record.getTitle());
                                dto.put("description", record.getDescription());
                                dto.put("uploadedAt", record.getUploadedAt());
                                dto.put("patientName", record.getPatient().getFirstName() + " " + record.getPatient().getLastName());
                                dto.put("patientId", record.getPatient().getId());
                                dto.put("permissionType", permission.getPermissionType());
                                dto.put("grantedAt", permission.getGrantedAt());
                                dto.put("canWrite", permission.getPermissionType().equals("WRITE") ||
                                        permission.getPermissionType().equals("FULL_ACCESS"));
                                dto.put("filePath", record.getFilePath());
                                return dto;
                            },
                            (existing, replacement) -> {
                                // In case of duplicates, keep the most recent one
                                LocalDateTime existingDate = (LocalDateTime) existing.get("grantedAt");
                                LocalDateTime replacementDate = (LocalDateTime) replacement.get("grantedAt");
                                return replacementDate.isAfter(existingDate) ? replacement : existing;
                            }
                    ))
                    .values()
                    .stream()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(recordDTOs);

        } catch (Exception e) {
            logger.error("Error fetching accessible records: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/patient-records/{doctorUserId}/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientRecords(@PathVariable Long doctorUserId, @PathVariable Long patientId) {
        try {
            // Get doctor by user ID
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(doctorUserId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Doctor doctor = doctorOpt.get();

            // Get patient by ID
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Patient patient = patientOpt.get();

            // ✅ FIXED: Use enhanced active permissions query with proper error handling
            LocalDateTime now = LocalDateTime.now();
            List<RecordPermission> permissions = recordPermissionRepository
                    .findActivePermissionsByPatientAndDoctor(patient, doctor, now);

            // ✅ FIXED: Filter out invalid permissions and handle lazy loading safely
            List<Map<String, Object>> accessibleRecords = permissions.stream()
                    .filter(permission -> {
                        try {
                            // ✅ NEW: Validate that medical record exists and is not null
                            MedicalRecord record = permission.getMedicalRecord();
                            return record != null && record.getId() != null && record.getId() > 0;
                        } catch (Exception e) {
                            logger.warn("Skipping invalid permission - medical record not accessible: {}", e.getMessage());
                            return false;
                        }
                    })
                    .collect(Collectors.toMap(
                            permission -> permission.getMedicalRecord().getId(),
                            permission -> {
                                try {
                                    MedicalRecord record = permission.getMedicalRecord();

                                    Map<String, Object> recordData = new HashMap<>();
                                    recordData.put("id", record.getId());
                                    recordData.put("title", record.getTitle() != null ? record.getTitle() : "Untitled Record");
                                    recordData.put("description", record.getDescription());
                                    recordData.put("recordType", record.getRecordType() != null ? record.getRecordType() : "OTHER");
                                    recordData.put("uploadedAt", record.getUploadedAt());
                                    recordData.put("updatedAt", record.getUpdatedAt());

                                    // ✅ NEW: Add enhanced medical record fields with null safety
                                    recordData.put("bloodGroup", record.getBloodGroup());
                                    recordData.put("bloodPressure", record.getBloodPressure());
                                    recordData.put("heartRate", record.getHeartRate());
                                    recordData.put("temperature", record.getTemperature());
                                    recordData.put("weight", record.getWeight());
                                    recordData.put("diagnosisCondition", record.getDiagnosisCondition());
                                    recordData.put("medication", record.getMedication());

                                    // ✅ Permission details
                                    recordData.put("permissionType", permission.getPermissionType());
                                    recordData.put("grantedAt", permission.getGrantedAt());
                                    recordData.put("expiresAt", permission.getExpiresAt());
                                    recordData.put("sharedFields", permission.getSharedFields());
                                    recordData.put("accessDurationHours", permission.getAccessDurationHours());

                                    // ✅ Calculate remaining time
                                    if (permission.getExpiresAt() != null) {
                                        try {
                                            long hoursRemaining = java.time.Duration.between(now, permission.getExpiresAt()).toHours();
                                            long minutesRemaining = java.time.Duration.between(now, permission.getExpiresAt()).toMinutes();
                                            recordData.put("hoursRemaining", Math.max(0, hoursRemaining));
                                            recordData.put("minutesRemaining", Math.max(0, minutesRemaining));
                                            recordData.put("isExpiringSoon", hoursRemaining <= 2);
                                            recordData.put("isExpired", hoursRemaining <= 0);
                                        } catch (Exception e) {
                                            logger.warn("Error calculating time remaining: {}", e.getMessage());
                                            recordData.put("hoursRemaining", -1);
                                            recordData.put("minutesRemaining", -1);
                                            recordData.put("isExpiringSoon", false);
                                            recordData.put("isExpired", false);
                                        }
                                    } else {
                                        recordData.put("hoursRemaining", -1); // No expiry
                                        recordData.put("minutesRemaining", -1);
                                        recordData.put("isExpiringSoon", false);
                                        recordData.put("isExpired", false);
                                    }

                                    recordData.put("filePath", record.getFilePath());
                                    recordData.put("patientName", patient.getFirstName() + " " + patient.getLastName());
                                    recordData.put("patientId", patient.getId());

                                    // ✅ Safe uploader info
                                    recordData.put("uploadedBy", "Patient: " + patient.getFirstName() + " " + patient.getLastName());

                                    // ✅ NEW: Add granular sharing info
                                    if (permission.getSharedFields() != null && !permission.getSharedFields().isEmpty()) {
                                        recordData.put("isGranularSharing", true);
                                        recordData.put("sharedFieldsList", List.of(permission.getSharedFields().split(",")));
                                    } else {
                                        recordData.put("isGranularSharing", false);
                                        recordData.put("sharedFieldsList", List.of("all"));
                                    }

                                    return recordData;

                                } catch (Exception e) {
                                    logger.error("Error processing medical record for permission {}: {}",
                                            permission.getId(), e.getMessage());
                                    // Return minimal safe data
                                    Map<String, Object> errorRecord = new HashMap<>();
                                    errorRecord.put("id", permission.getId());
                                    errorRecord.put("title", "Error Loading Record");
                                    errorRecord.put("recordType", "ERROR");
                                    errorRecord.put("error", true);
                                    return errorRecord;
                                }
                            },
                            (existing, replacement) -> {
                                // In case of duplicates, keep the most recent one
                                try {
                                    LocalDateTime existingDate = (LocalDateTime) existing.get("grantedAt");
                                    LocalDateTime replacementDate = (LocalDateTime) replacement.get("grantedAt");
                                    return (existingDate != null && replacementDate != null && replacementDate.isAfter(existingDate))
                                            ? replacement : existing;
                                } catch (Exception e) {
                                    return replacement; // Default to replacement if comparison fails
                                }
                            }
                    ))
                    .values()
                    .stream()
                    .filter(record -> !Boolean.TRUE.equals(record.get("error"))) // Filter out error records
                    .sorted((a, b) -> {
                        // Sort by granted date, most recent first
                        try {
                            LocalDateTime dateA = (LocalDateTime) a.get("grantedAt");
                            LocalDateTime dateB = (LocalDateTime) b.get("grantedAt");
                            if (dateA == null && dateB == null) return 0;
                            if (dateA == null) return 1;
                            if (dateB == null) return -1;
                            return dateB.compareTo(dateA);
                        } catch (Exception e) {
                            return 0; // Keep original order if comparison fails
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(accessibleRecords);
        } catch (Exception e) {
            logger.error("Error fetching patient records: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ ADD THIS METHOD to your DoctorController class
    @GetMapping("/view-record/{doctorUserId}/{recordId}")
    public ResponseEntity<Resource> viewMedicalRecord(@PathVariable Long doctorUserId, @PathVariable Long recordId) {
        try {
            // Validate doctor
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(doctorUserId);
            if (doctorOpt.isEmpty()) {
                logger.error("Doctor not found for user ID: {}", doctorUserId);
                return ResponseEntity.status(403).build(); // Forbidden instead of 404
            }

            Doctor doctor = doctorOpt.get();
            logger.info("Doctor found: {} - Checking record access", doctor.getFirstName());

            // Get the medical record
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (recordOpt.isEmpty()) {
                logger.error("Medical record not found: {}", recordId);
                return ResponseEntity.status(403).build(); // Forbidden instead of 404
            }

            MedicalRecord record = recordOpt.get();
            logger.info("Medical record found: {} - Checking permissions", record.getTitle());

            // ✅ CRITICAL: Check active permissions with proper time validation
            LocalDateTime now = LocalDateTime.now();
            List<RecordPermission> permissions = recordPermissionRepository
                    .findActivePermissionsByPatientAndDoctor(record.getPatient(), doctor, now);

            // Find permission for this specific record
            Optional<RecordPermission> validPermission = permissions.stream()
                    .filter(p -> p.getMedicalRecord().getId().equals(recordId))
                    .filter(p -> p.getIsGranted())
                    .filter(p -> p.getRevokedAt() == null)
                    .filter(p -> p.getExpiresAt() == null || p.getExpiresAt().isAfter(now))
                    .findFirst();

            if (validPermission.isEmpty()) {
                logger.error("No valid permission found for doctor {} and record {}. Available permissions: {}",
                        doctorUserId, recordId, permissions.size());
                return ResponseEntity.status(403).build(); // Forbidden
            }

            logger.info("Valid permission found: {} for doctor: {}",
                    validPermission.get().getPermissionType(), doctor.getFirstName());

            // Load file as Resource
            if (record.getFilePath() == null || record.getFilePath().isEmpty()) {
                logger.error("File path is empty for record: {}", recordId);
                return ResponseEntity.status(403).build();
            }

            Path filePath = Paths.get(record.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Get file extension to determine content type
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    // Fallback content type detection
                    String fileName = filePath.getFileName().toString().toLowerCase();
                    if (fileName.endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (fileName.endsWith(".png")) {
                        contentType = "image/png";
                    } else if (fileName.endsWith(".txt")) {
                        contentType = "text/plain";
                    } else {
                        contentType = "application/octet-stream";
                    }
                }

                logger.info("Serving file for viewing: {} with content type: {}", filePath, contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + record.getTitle() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .header(HttpHeaders.PRAGMA, "no-cache")
                        .header(HttpHeaders.EXPIRES, "0")
                        .body(resource);
            } else {
                logger.error("File not found or not readable: {}", record.getFilePath());
                return ResponseEntity.status(403).build();
            }

        } catch (Exception e) {
            logger.error("Error viewing medical record {}: {}", recordId, e.getMessage(), e);
            return ResponseEntity.status(403).build(); // Return 403 instead of 500 for security
        }
    }




}
