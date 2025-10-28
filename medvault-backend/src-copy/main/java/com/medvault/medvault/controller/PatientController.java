package com.medvault.medvault.controller;

import com.medvault.medvault.dto.*;
import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.*;
import com.medvault.medvault.service.RecordPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;
import jakarta.annotation.PostConstruct;
import com.medvault.medvault.service.EmailService;

import com.medvault.medvault.model.Feedback;
import com.medvault.medvault.repository.FeedbackRepository;
import com.medvault.medvault.dto.FeedbackDTO;

import com.medvault.medvault.model.MedicalRecord;
import com.medvault.medvault.model.RecordPermission;
import com.medvault.medvault.repository.MedicalRecordRepository;
import com.medvault.medvault.repository.RecordPermissionRepository;



@RestController
@RequestMapping("/api/patient")

public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);
    private static final String UPLOAD_DIR = "uploads/patient-documents/";

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private RecordPermissionRepository recordPermissionRepository;

    @Autowired
    private RecordPermissionService recordPermissionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService; // <-- Add this

    @Autowired
    private FeedbackRepository feedbackRepository;


    @PostConstruct
    public void init() {
        try {
            String uploadDirPath = System.getProperty("user.dir") + File.separator + UPLOAD_DIR;
            Path uploadPath = Paths.get(uploadDirPath);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created patient upload directory: " + uploadPath.toAbsolutePath());
            }
        } catch (Exception e) {
            logger.error("Failed to create patient upload directory", e);
        }
    }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> createOrUpdateProfile(@PathVariable Long userId,
                                                                     @RequestBody PatientProfileRequest request) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getRole() != Role.PATIENT) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid patient user"));
            }

            Optional<Patient> existingPatient = patientRepository.findByUserId(userId);
            Patient patient;

            if (existingPatient.isPresent()) {
                patient = existingPatient.get();
            } else {
                patient = new Patient();
                patient.setUserId(userId);
                patient.setStatus(PatientStatus.INACTIVE);
                patient.setDocumentUploaded(false);
                patient.setProfileComplete(false);
            }

            // Update profile data
            patient.setFirstName(request.getFirstName());
            patient.setLastName(request.getLastName());
            patient.setGender(Gender.valueOf(String.valueOf(request.getGender())));
            patient.setDateOfBirth(request.getDateOfBirth());
            patient.setContactNumber(request.getContactNumber());
            patient.setEmail(request.getEmail());
            patient.setAddress(request.getAddress());
            patient.setEmergencyContact(request.getEmergencyContact());
            patient.setProfileComplete(true);

            Patient savedPatient = patientRepository.save(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile saved successfully");
            response.put("patient", savedPatient);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error saving patient profile: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Patient> getProfile(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);

            if (patientOpt.isPresent()) {
                return ResponseEntity.ok(patientOpt.get());
            } else {
                Patient emptyPatient = new Patient();
                emptyPatient.setUserId(userId);
                emptyPatient.setStatus(PatientStatus.INACTIVE);
                emptyPatient.setProfileComplete(false);
                emptyPatient.setDocumentUploaded(false);
                return ResponseEntity.ok(emptyPatient);
            }
        } catch (Exception e) {
            logger.error("Error fetching patient profile: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/upload-document/{userId}")
    public ResponseEntity<Map<String, Object>> uploadDocument(@PathVariable Long userId,
                                                              @RequestParam("governmentId") MultipartFile governmentId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty() || !Boolean.TRUE.equals(patientOpt.get().getProfileComplete())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please complete basic profile information first"));
            }

            Patient patient = patientOpt.get();
            String uploadDirPath = System.getProperty("user.dir") + File.separator + UPLOAD_DIR;
            Path uploadPath = Paths.get(uploadDirPath);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save government ID
            if (!governmentId.isEmpty()) {
                String govIdFileName = userId + "_gov_id_" + System.currentTimeMillis() + "_" + governmentId.getOriginalFilename();
                Path govIdPath = uploadPath.resolve(govIdFileName);

                Files.write(govIdPath, governmentId.getBytes());
                patient.setGovernmentIdPath(govIdPath.toString());
                logger.info("Saved patient government ID: " + govIdPath.toString());
            }

            patient.setDocumentUploaded(true);
            patient.setStatus(PatientStatus.PENDING);
            patientRepository.save(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document uploaded successfully. Awaiting admin approval.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading document: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error processing document upload: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Upload processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/doctors/approved")
    public ResponseEntity<List<Doctor>> getApprovedDoctors() {
        try {
            List<Doctor> approvedDoctors = doctorRepository.findByStatus(DoctorStatus.APPROVED);
            return ResponseEntity.ok(approvedDoctors);
        } catch (Exception e) {
            logger.error("Error fetching approved doctors: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/doctors/{doctorId}/available-slots")
    public ResponseEntity<List<TimeSlot>> getAvailableSlots(@PathVariable Long doctorId) {
        try {
            List<TimeSlot> availableSlots = timeSlotRepository.findByDoctorIdAndIsAvailableTrue(doctorId);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            logger.error("Error fetching available slots: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }


    @PostMapping("/appointments/{patientId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> bookAppointment(@PathVariable Long patientId,
                                                               @RequestBody AppointmentRequest request) {
        try {
            logger.info("Booking attempt - Patient ID: {}, Doctor ID: {}, Slot ID: {}",
                    patientId, request.getDoctorId(), request.getSlotId());

            // 1. Validate Patient
            Optional<Patient> patientOpt = patientRepository.findByUserId(patientId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Patient profile not found. Please complete your profile first.",
                        "action", "COMPLETE_PROFILE"
                ));
            }

            Patient patient = patientOpt.get();
            if (patient.getStatus() != PatientStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Your account is pending approval. Please wait for admin approval.",
                        "status", patient.getStatus().toString(),
                        "action", "WAIT_APPROVAL"
                ));
            }

            // 2. Validate Doctor
            Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
            if (doctorOpt.isEmpty() || doctorOpt.get().getStatus() != DoctorStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Selected doctor is not available",
                        "action", "SELECT_DIFFERENT_DOCTOR"
                ));
            }

            // 3. Validate Slot Exists
            Optional<TimeSlot> slotOpt = timeSlotRepository.findById(request.getSlotId());
            if (slotOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Selected time slot no longer exists. Please refresh and try again.",
                        "action", "REFRESH_SLOTS"
                ));
            }

            TimeSlot slot = slotOpt.get();

            // 4. Check if slot is still available
            if (!slot.getIsAvailable()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "This time slot is no longer available",
                        "action", "SELECT_DIFFERENT_SLOT"
                ));
            }

            // 5. Check if slot is not expired
            if (slot.getStartTime().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cannot book expired time slot",
                        "action", "SELECT_FUTURE_SLOT"
                ));
            }

            // 6. Check for duplicate booking
            List<Appointment> existingAppointments = appointmentRepository.findBySlotId(request.getSlotId());
            if (!existingAppointments.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "This slot has already been booked by another patient",
                        "action", "SELECT_DIFFERENT_SLOT"
                ));
            }

            // 7. Create appointment
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctorOpt.get());
            appointment.setSlotId(request.getSlotId());
            appointment.setPatientNotes(request.getPatientNotes());
            appointment.setStatus(AppointmentStatus.PENDING);

            Appointment savedAppointment = appointmentRepository.save(appointment);

            // 8. Mark slot as booked
            slot.setIsAvailable(false);
            timeSlotRepository.save(slot);

            // 9. ✨ Send email notification to doctor
            Doctor doctor = doctorOpt.get();
            emailService.sendAppointmentNotificationToDoctor(
                    doctor.getEmail(),
                    doctor.getFirstName() + " " + doctor.getLastName(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    slot.getStartTime()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Appointment booked successfully! Awaiting doctor confirmation.",
                    "appointmentId", savedAppointment.getId(),
                    "status", "PENDING"
            ));

        } catch (Exception e) {
            logger.error("Booking failed for patient {}: {}", patientId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Booking failed. Please try again later.",
                    "action", "RETRY"
            ));
        }
    }


    private AppointmentDTO convertToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setStatus(appointment.getStatus());
        dto.setPatientNotes(appointment.getPatientNotes());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());

        // Get doctor details from the entity relationship
        if (appointment.getDoctor() != null) {
            Doctor doctor = appointment.getDoctor();
            dto.setDoctorId(doctor.getId()); // ← ADD THIS LINE
            dto.setDoctorName("Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
            dto.setDoctorSpecialization(doctor.getSpecialization());
            dto.setDoctorContact(doctor.getContactNumber());
            dto.setConsultationFees(doctor.getConsultationFees());
        }

        // Get slot details
        if (appointment.getSlotId() != null) {
            Optional<TimeSlot> slot = timeSlotRepository.findById(appointment.getSlotId());
            if (slot.isPresent()) {
                dto.setAppointmentStartTime(slot.get().getStartTime());
                dto.setAppointmentEndTime(slot.get().getEndTime());
            }
        }

        return dto;
    }


    @GetMapping("/dashboard-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("nextAppointment", null);
                emptyResponse.put("completedVisits", 0);
                emptyResponse.put("activePrescriptions", 0);
                return ResponseEntity.ok(emptyResponse);
            }

            Patient patient = patientOpt.get();

            // ✅ FIXED: Get the next upcoming appointment (future appointments only)
            List<Appointment> approvedAppointments = appointmentRepository
                    .findByPatientAndStatus(patient, AppointmentStatus.APPROVED);

            Appointment nextAppointment = null;
            LocalDateTime now = LocalDateTime.now();

            for (Appointment apt : approvedAppointments) {
                Optional<TimeSlot> slotOpt = timeSlotRepository.findById(apt.getSlotId());
                if (slotOpt.isPresent() && slotOpt.get().getStartTime().isAfter(now)) {
                    if (nextAppointment == null || slotOpt.get().getStartTime().isBefore(
                            timeSlotRepository.findById(nextAppointment.getSlotId()).get().getStartTime())) {
                        nextAppointment = apt;
                    }
                }
            }

            long completedVisits = appointmentRepository.countByPatientAndStatus(patient, AppointmentStatus.COMPLETED);
            long activePrescriptions = 0;

            Map<String, Object> response = new HashMap<>();
            response.put("nextAppointment", nextAppointment != null ? convertToDTO(nextAppointment) : null);
            response.put("completedVisits", completedVisits);
            response.put("activePrescriptions", activePrescriptions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching dashboard stats: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch dashboard stats"));
        }
    }



    @GetMapping("/appointments/{userId}")
    public ResponseEntity<List<AppointmentDTO>> getPatientAppointments(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<Appointment> appointments = appointmentRepository
                    .findByPatientOrderByCreatedAtDesc(patientOpt.get());

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToDTO) // Use the helper method
                    .collect(Collectors.toList());

            return ResponseEntity.ok(appointmentDTOs);
        } catch (Exception e) {
            logger.error("Error fetching patient appointments: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/feedback/{userId}")
    public ResponseEntity<Map<String, Object>> submitFeedback(@PathVariable Long userId,
                                                              @RequestBody FeedbackRequest request) {
        try {
            // Validate patient
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();

            // Validate appointment
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(request.getAppointmentId());
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            // Check if appointment belongs to the patient
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized to provide feedback for this appointment"));
            }

            // Check if appointment is completed
            if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback can only be provided for completed appointments"));
            }

            // Check if feedback already exists
            Optional<Feedback> existingFeedback = feedbackRepository.findByAppointment(appointment);
            if (existingFeedback.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback already provided for this appointment"));
            }

            // Validate rating
            if (request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }

            // Create feedback
            Feedback feedback = new Feedback();
            feedback.setPatient(patient);
            feedback.setDoctor(appointment.getDoctor());
            feedback.setAppointment(appointment);
            feedback.setRating(request.getRating());
            feedback.setComment(request.getComment());
            feedback.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
            feedback.setFeedbackDate(LocalDateTime.now());

            feedbackRepository.save(feedback);

            return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));

        } catch (Exception e) {
            logger.error("Error submitting feedback: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to submit feedback"));
        }
    }

    @GetMapping("/my-feedback/{userId}")
    public ResponseEntity<List<FeedbackDTO>> getMyFeedback(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<Feedback> feedbacks = feedbackRepository.findByPatientOrderByFeedbackDateDesc(patientOpt.get());

            List<FeedbackDTO> feedbackDTOs = feedbacks.stream()
                    .map(this::convertFeedbackToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(feedbackDTOs);
        } catch (Exception e) {
            logger.error("Error fetching patient feedback: " + e.getMessage(), e);
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



    @PostMapping("/emergency-request/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> createEmergencyRequest(@PathVariable Long userId, @RequestBody EmergencyRequest request) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }
            Patient patient = patientOpt.get();

            // Create emergency appointment WITHOUT doctor
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            // Don't set doctor - leave it null for emergency requests
            appointment.setSlotId(null); // Emergency requests don't need specific slots
            appointment.setPatientNotes("EMERGENCY: " + request.getSymptoms() +
                    (request.getPatientNotes() != null ? " | Notes: " + request.getPatientNotes() : ""));
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setIsEmergency(true);
            appointment.setUrgencyLevel(request.getUrgencyLevel());
            appointment.setCreatedAt(LocalDateTime.now());
            appointment.setUpdatedAt(LocalDateTime.now());

            Appointment savedAppointment = appointmentRepository.save(appointment);

            return ResponseEntity.ok(Map.of(
                    "message", "Emergency request submitted successfully",
                    "appointmentId", savedAppointment.getId()
            ));
        } catch (Exception e) {
            logger.error("Error creating emergency request: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to submit emergency request"));
        }
    }




    // Add these methods to PatientController
    @PostMapping("/medical-records/upload/{userId}")
    public ResponseEntity<Map<String, Object>> uploadMedicalRecord(@PathVariable Long userId,
                                                                   @RequestParam("file") MultipartFile file,
                                                                   @RequestParam("recordType") String recordType,
                                                                   @RequestParam("title") String title,
                                                                   @RequestParam(value = "description", required = false) String description) {
        try {
            // Validate patient
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();

            // Create upload directory for medical records
            String uploadDirPath = System.getProperty("user.dir") + File.separator + "uploads/medical-records/";
            Path uploadPath = Paths.get(uploadDirPath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            String fileName = userId + "_" + recordType + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            // Create medical record entry
            MedicalRecord record = new MedicalRecord();
            record.setPatient(patient);
            record.setRecordType(recordType);
            record.setTitle(title);
            record.setDescription(description);
            record.setFilePath(filePath.toString());
            record.setUploadedAt(LocalDateTime.now());

            medicalRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "message", "Medical record uploaded successfully",
                    "recordId", record.getId()
            ));

        } catch (Exception e) {
            logger.error("Error uploading medical record: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
        }
    }

    @GetMapping("/medical-records/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getMedicalRecords(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<MedicalRecord> records = medicalRecordRepository
                    .findByPatientOrderByUploadedAtDesc(patientOpt.get());

            List<Map<String, Object>> recordDTOs = records.stream().map(record -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", record.getId());
                dto.put("recordType", record.getRecordType());
                dto.put("title", record.getTitle());
                dto.put("description", record.getDescription());
                dto.put("uploadedAt", record.getUploadedAt());
                dto.put("updatedAt", record.getUpdatedAt());

                // ✅ Enhanced fields
                dto.put("bloodGroup", record.getBloodGroup());
                dto.put("bloodPressure", record.getBloodPressure());
                dto.put("heartRate", record.getHeartRate());
                dto.put("temperature", record.getTemperature());
                dto.put("weight", record.getWeight());
                dto.put("diagnosisCondition", record.getDiagnosisCondition());
                dto.put("medication", record.getMedication());

                // ✅ FIXED: Permission mapping with ID field
                List<RecordPermission> permissions = recordPermissionRepository.findAll().stream()
                        .filter(p -> p.getMedicalRecord().getId().equals(record.getId()) && p.getIsGranted())
                        .collect(Collectors.toList());

                dto.put("sharedWithDoctors", permissions.size());
                dto.put("permissions", permissions.stream().map(p -> {
                    Map<String, Object> permMap = new HashMap<>();

                    // ✅ CRITICAL: Add the permission ID field (this was missing!)
                    permMap.put("id", p.getId());
                    permMap.put("permissionId", p.getId());  // Alternative field name
                    permMap.put("doctorId", p.getDoctor().getId());
                    permMap.put("doctorName", "Dr. " + p.getDoctor().getFirstName() + " " + p.getDoctor().getLastName());
                    permMap.put("permissionType", p.getPermissionType());
                    permMap.put("grantedAt", p.getGrantedAt());
                    permMap.put("expiresAt", p.getExpiresAt());
                    permMap.put("sharedFields", p.getSharedFields());

                    // ✅ Calculate time remaining
                    if (p.getExpiresAt() != null) {
                        try {
                            long hoursRemaining = java.time.Duration.between(LocalDateTime.now(), p.getExpiresAt()).toHours();
                            permMap.put("hoursRemaining", Math.max(0, hoursRemaining));
                        } catch (Exception e) {
                            permMap.put("hoursRemaining", -1);
                        }
                    } else {
                        permMap.put("hoursRemaining", -1); // No expiry
                    }

                    // ✅ DEBUG: Log what we're sending to frontend
                    logger.info("Sending permission: id={}, doctorName={}", p.getId(), permMap.get("doctorName"));

                    return permMap;
                }).collect(Collectors.toList()));

                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(recordDTOs);
        } catch (Exception e) {
            logger.error("Error fetching medical records", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }


    // ✅ FIXED: Grant Permission Method
    @PostMapping("/records/grant-permission/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> grantRecordPermission(@PathVariable Long userId,
                                                                     @RequestBody Map<String, Object> request) {
        try {
            // Validate patient
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            Long recordId = Long.valueOf(request.get("recordId").toString());
            String permissionType = request.get("permissionType").toString(); // READ, WRITE, FULL_ACCESS

            // Validate doctor
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Doctor not found"));
            }

            // Validate medical record belongs to patient
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (recordOpt.isEmpty() || !recordOpt.get().getPatient().getId().equals(patient.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Medical record not found or access denied"));
            }

            MedicalRecord record = recordOpt.get();
            Doctor doctor = doctorOpt.get();

            // ✅ FIXED: Check if permission already exists using new method
            Optional<RecordPermission> existingPermission = recordPermissionRepository
                    .findLatestByPatientAndDoctorAndMedicalRecord(patient, doctor, record);

            RecordPermission permission;
            if (existingPermission.isPresent()) {
                // Update existing permission
                permission = existingPermission.get();
                permission.setIsGranted(true);
                permission.setPermissionType(permissionType);
                permission.setGrantedAt(LocalDateTime.now());
                permission.setRevokedAt(null);
            } else {
                // Create new permission
                permission = new RecordPermission();
                permission.setPatient(patient);
                permission.setDoctor(doctor);
                permission.setMedicalRecord(record);
                permission.setPermissionType(permissionType);
                permission.setIsGranted(true);
                permission.setGrantedAt(LocalDateTime.now());
            }

            recordPermissionRepository.save(permission);

            // Send email notification to doctor
            emailService.sendRecordAccessGrantedNotification(
                    doctor.getEmail(),
                    doctor.getFirstName(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    record.getTitle(),
                    permissionType
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Permission granted successfully",
                    "doctorName", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName(),
                    "recordTitle", record.getTitle()
            ));

        } catch (Exception e) {
            logger.error("Error granting record permission: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to grant permission"));
        }
    }


    @PostMapping("/records/revoke-permission/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> revokeRecordPermission(@PathVariable Long userId,
                                                                      @RequestBody Map<String, Object> request) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();
            Long permissionId = Long.valueOf(request.get("permissionId").toString());

            Optional<RecordPermission> permissionOpt = recordPermissionRepository.findById(permissionId);
            if (permissionOpt.isEmpty() || !permissionOpt.get().getPatient().getId().equals(patient.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Permission not found or access denied"));
            }

            RecordPermission permission = permissionOpt.get();
            permission.setIsGranted(false);
            permission.setRevokedAt(LocalDateTime.now());
            recordPermissionRepository.save(permission);

            // Send email notification to doctor
            emailService.sendRecordAccessRevokedNotification(
                    permission.getDoctor().getEmail(),
                    permission.getDoctor().getFirstName(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    permission.getMedicalRecord().getTitle()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Permission revoked successfully",
                    "doctorName", "Dr. " + permission.getDoctor().getFirstName() + " " + permission.getDoctor().getLastName()
            ));

        } catch (Exception e) {
            logger.error("Error revoking record permission: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to revoke permission"));
        }
    }



    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
    }

    // ✅ GRANULAR PERMISSION SHARING with Time Limits
    @PostMapping("/records/grant-granular-permission/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> grantGranularPermission(@PathVariable Long userId,
                                                                       @RequestBody Map<String, Object> request) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            Long recordId = Long.valueOf(request.get("recordId").toString());
            String permissionType = request.get("permissionType").toString();

            // ✅ NEW: Granular field sharing
            List<String> sharedFields = (List<String>) request.get("sharedFields"); // e.g., ["bloodGroup", "bloodPressure"]

            // ✅ NEW: Custom time duration (default 24 hours)
            Integer durationHours = request.containsKey("durationHours") ?
                    Integer.valueOf(request.get("durationHours").toString()) : 24;

            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);

            if (doctorOpt.isEmpty() || recordOpt.isEmpty() ||
                    !recordOpt.get().getPatient().getId().equals(patient.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid doctor or record"));
            }

            MedicalRecord record = recordOpt.get();
            Doctor doctor = doctorOpt.get();

            // Use service to grant granular permission
            RecordPermission permission = recordPermissionService.grantGranularPermission(
                    patient, doctor, record, permissionType, sharedFields, durationHours
            );

            // Send email notification
            emailService.sendGranularAccessGrantedNotification(
                    doctor.getEmail(),
                    doctor.getFirstName(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    record.getTitle(),
                    sharedFields,
                    durationHours
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Granular permission granted successfully",
                    "permissionId", permission.getId(),
                    "expiresAt", permission.getExpiresAt(),
                    "sharedFields", sharedFields != null ? sharedFields : List.of("all"),
                    "durationHours", durationHours
            ));

        } catch (Exception e) {
            logger.error("Error granting granular permission: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to grant permission"));
        }
    }

    // ✅ FIXED: Keep original endpoint but fix null safety
    @PostMapping("/records/revoke-permission-immediate/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> revokePermissionImmediate(@PathVariable Long userId,
                                                                         @RequestBody Map<String, Object> request) {
        try {
            logger.info("Revoke request received for user {}: {}", userId, request);

            // ✅ FIXED: Safe null checking for permissionId
            Object permissionIdObj = request.get("permissionId");
            if (permissionIdObj == null) {
                logger.error("Permission ID is missing from request: {}", request);
                return ResponseEntity.badRequest().body(Map.of("error", "Permission ID is required"));
            }

            Long permissionId;
            try {
                permissionId = Long.valueOf(permissionIdObj.toString());
            } catch (NumberFormatException e) {
                logger.error("Invalid permission ID format: {}", permissionIdObj);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid permission ID format"));
            }

            boolean revoked = recordPermissionService.revokePermissionImmediately(permissionId, userId);

            if (revoked) {
                logger.info("Successfully revoked permission {} for user {}", permissionId, userId);
                return ResponseEntity.ok(Map.of(
                        "message", "Permission revoked immediately",
                        "permissionId", permissionId,
                        "revokedAt", LocalDateTime.now(),
                        "doctorNotified", true
                ));
            } else {
                logger.warn("Failed to revoke permission {} for user {} - permission not found or already revoked", permissionId, userId);
                return ResponseEntity.badRequest().body(Map.of("error", "Permission not found or already revoked"));
            }

        } catch (Exception e) {
            logger.error("Error revoking permission for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to revoke permission"));
        }
    }

    @PostMapping("/reschedule-appointment/{patientUserId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> rescheduleAppointment(@PathVariable Long patientUserId,
                                                                     @RequestBody Map<String, Object> request) {
        try {
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            Long newSlotId = Long.valueOf(request.get("newSlotId").toString());
            String reason = request.get("reason").toString();

            logger.info("Rescheduling appointment {} for patient user ID: {}", appointmentId, patientUserId);

            // Get appointment and validate
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                logger.error("Appointment not found: {}", appointmentId);
                return ResponseEntity.badRequest().body(Map.of("error", "Appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            // Check if patient owns this appointment using userId
            if (!appointment.getPatient().getUserId().equals(patientUserId)) {
                logger.error("Access denied. Patient user ID {} does not own appointment {}", patientUserId, appointmentId);
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // ✅ DECLARE variables at the top level scope
            Patient patient = appointment.getPatient();
            Doctor doctor = appointment.getDoctor();
            String patientName = patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "");
            String doctorName = doctor.getFirstName() + " " + (doctor.getLastName() != null ? doctor.getLastName() : "");

            LocalDateTime now = LocalDateTime.now();

            // Get current time slot for the appointment
            Optional<TimeSlot> currentSlotOpt = timeSlotRepository.findById(appointment.getSlotId());
            LocalDateTime appointmentTime = null;
            if (currentSlotOpt.isPresent()) {
                appointmentTime = currentSlotOpt.get().getStartTime();
            }

            // Check 24-hour rule for approved appointments
            if (appointment.getStatus() == AppointmentStatus.APPROVED && appointmentTime != null) {
                Duration duration = Duration.between(now, appointmentTime);
                long hoursUntilAppointment = duration.toHours();

                if (hoursUntilAppointment <= 24) {
                    logger.warn("Cannot reschedule approved appointment {} - only {} hours remaining", appointmentId, hoursUntilAppointment);
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Approved appointments can only be rescheduled up to 24 hours in advance",
                            "hoursRemaining", hoursUntilAppointment
                    ));
                }
            }

            // Get and validate new time slot
            Optional<TimeSlot> newSlotOpt = timeSlotRepository.findById(newSlotId);
            if (newSlotOpt.isEmpty()) {
                logger.error("New time slot not found: {}", newSlotId);
                return ResponseEntity.badRequest().body(Map.of("error", "Selected time slot not found"));
            }

            TimeSlot newSlot = newSlotOpt.get();
            if (!newSlot.getIsAvailable()) {
                logger.warn("New time slot {} is not available", newSlotId);
                return ResponseEntity.badRequest().body(Map.of("error", "Selected time slot is not available"));
            }

            // Store old and new times for email notifications
            LocalDateTime oldTime = appointmentTime;
            LocalDateTime newTime = newSlot.getStartTime();

            // Free up old slot if it exists
            if (currentSlotOpt.isPresent()) {
                TimeSlot oldSlot = currentSlotOpt.get();
                oldSlot.setIsAvailable(true);
                timeSlotRepository.save(oldSlot);
                logger.info("Freed up old time slot: {}", oldSlot.getId());
            }

            // Update appointment with new slot
            appointment.setSlotId(newSlotId);
            appointment.setRescheduleReason(reason);
            appointment.setUpdatedAt(now);

            // Status handling based on original status
            boolean wasApproved = appointment.getStatus() == AppointmentStatus.APPROVED;
            if (wasApproved) {
                appointment.setStatus(AppointmentStatus.PENDING);
                logger.info("Changed appointment status from APPROVED to PENDING for re-approval");
            } else {
                logger.info("Appointment rescheduled, status remains: {}", appointment.getStatus());
            }

            // Mark new slot as unavailable
            newSlot.setIsAvailable(false);

            // Save all changes
            appointmentRepository.save(appointment);
            timeSlotRepository.save(newSlot);

            logger.info("Appointment {} successfully rescheduled to slot {}", appointmentId, newSlotId);

            // ✅ Send email notifications (variables are now accessible)
            try {
                // Email to doctor about rescheduling request
                emailService.sendAppointmentRescheduleNotification(
                        doctor.getEmail(),
                        doctor.getFirstName(),
                        patientName,
                        oldTime != null ? oldTime : newTime,
                        newTime,
                        reason
                );

                // Email to patient confirming reschedule request
                emailService.sendRescheduleConfirmationToPatient(
                        patient.getEmail(),
                        patient.getFirstName(),
                        doctorName,
                        oldTime != null ? oldTime : newTime,
                        newTime,
                        wasApproved
                );

                logger.info("Reschedule notification emails sent successfully");

            } catch (Exception e) {
                logger.error("Failed to send reschedule notifications: {}", e.getMessage(), e);
                // Don't fail the reschedule operation if email fails
            }

            // ✅ Return success response (doctorName is now accessible)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", wasApproved ? "Appointment rescheduled - awaiting doctor approval" : "Appointment rescheduled successfully");
            response.put("appointmentId", appointment.getId());
            response.put("newTime", newTime.toString());
            response.put("status", appointment.getStatus().toString());
            response.put("requiresApproval", wasApproved);
            response.put("doctorName", doctorName); // ✅ Now accessible
            response.put("patientName", patientName);

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            logger.error("Invalid number format in reschedule request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid appointment or slot ID"));
        } catch (Exception e) {
            logger.error("Error rescheduling appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reschedule appointment. Please try again."));
        }
    }






    // ✅ ENHANCED UPLOAD with Blood Group, Vitals, Diagnosis
    @PostMapping("/medical-records/upload-enhanced/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> uploadEnhancedMedicalRecord(@PathVariable Long userId,
                                                                           @RequestParam("file") MultipartFile file,
                                                                           @RequestParam("recordType") String recordType,
                                                                           @RequestParam("title") String title,
                                                                           @RequestParam(value = "description", required = false) String description,
                                                                           @RequestParam(value = "bloodGroup", required = false) String bloodGroup,
                                                                           @RequestParam(value = "bloodPressure", required = false) String bloodPressure,
                                                                           @RequestParam(value = "heartRate", required = false) Integer heartRate,
                                                                           @RequestParam(value = "temperature", required = false) Double temperature,
                                                                           @RequestParam(value = "weight", required = false) Double weight,
                                                                           @RequestParam(value = "diagnosisCondition", required = false) String diagnosisCondition,
                                                                           @RequestParam(value = "medication", required = false) String medication) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Patient patient = patientOpt.get();

            // File handling (same as before)
            String uploadDirPath = System.getProperty("user.dir") + File.separator + "uploads/medical-records/";
            Path uploadPath = Paths.get(uploadDirPath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = userId + "_" + recordType + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            // Create enhanced medical record
            MedicalRecord record = new MedicalRecord();
            record.setPatient(patient);
            record.setRecordType(recordType);
            record.setTitle(title);
            record.setDescription(description);
            record.setFilePath(filePath.toString());
            record.setUploadedAt(LocalDateTime.now());

            // ✅ NEW: Set vitals and diagnosis fields
            record.setBloodGroup(bloodGroup);
            record.setBloodPressure(bloodPressure);
            record.setHeartRate(heartRate);
            record.setTemperature(temperature);
            record.setWeight(weight);
            record.setDiagnosisCondition(diagnosisCondition);
            record.setMedication(medication);

            medicalRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "message", "Enhanced medical record uploaded successfully",
                    "recordId", record.getId(),
                    "vitalsIncluded", bloodGroup != null || bloodPressure != null || heartRate != null || temperature != null || weight != null,
                    "diagnosisIncluded", diagnosisCondition != null,
                    "medicationIncluded", medication != null && !medication.trim().isEmpty()
            ));

        } catch (Exception e) {
            logger.error("Error uploading enhanced medical record: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
        }
    }

    // ✅ EDIT MEDICAL RECORD
    @PutMapping("/medical-records/edit/{userId}/{recordId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> editMedicalRecord(@PathVariable Long userId,
                                                                 @PathVariable Long recordId,
                                                                 @RequestBody Map<String, Object> updateData) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (recordOpt.isEmpty() || !recordOpt.get().getPatient().getId().equals(patientOpt.get().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Medical record not found or access denied"));
            }

            MedicalRecord record = recordOpt.get();

            // Update all fields if provided
            if (updateData.containsKey("title")) record.setTitle((String) updateData.get("title"));
            if (updateData.containsKey("description")) record.setDescription((String) updateData.get("description"));
            if (updateData.containsKey("bloodGroup")) record.setBloodGroup((String) updateData.get("bloodGroup"));
            if (updateData.containsKey("bloodPressure")) record.setBloodPressure((String) updateData.get("bloodPressure"));
            if (updateData.containsKey("heartRate")) {
                Object heartRateObj = updateData.get("heartRate");
                record.setHeartRate(heartRateObj != null ? Integer.valueOf(heartRateObj.toString()) : null);
            }
            if (updateData.containsKey("temperature")) {
                Object tempObj = updateData.get("temperature");
                record.setTemperature(tempObj != null ? Double.valueOf(tempObj.toString()) : null);
            }
            if (updateData.containsKey("weight")) {
                Object weightObj = updateData.get("weight");
                record.setWeight(weightObj != null ? Double.valueOf(weightObj.toString()) : null);
            }
            if (updateData.containsKey("diagnosisCondition")) record.setDiagnosisCondition((String) updateData.get("diagnosisCondition"));
            if (updateData.containsKey("medication")) record.setMedication((String) updateData.get("medication"));

            record.setUpdatedAt(LocalDateTime.now());
            medicalRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "message", "Medical record updated successfully",
                    "recordId", record.getId(),
                    "updatedAt", record.getUpdatedAt()
            ));

        } catch (Exception e) {
            logger.error("Error editing medical record: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update medical record"));
        }
    }

    // ✅ DELETE MEDICAL RECORD
    @DeleteMapping("/medical-records/delete/{userId}/{recordId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteMedicalRecord(@PathVariable Long userId,
                                                                   @PathVariable Long recordId) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
            }

            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (recordOpt.isEmpty() || !recordOpt.get().getPatient().getId().equals(patientOpt.get().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Medical record not found or access denied"));
            }

            MedicalRecord record = recordOpt.get();

            // Revoke all permissions and notify doctors
            List<RecordPermission> activePermissions = recordPermissionRepository.findByMedicalRecordAndIsGrantedTrue(record);

            for (RecordPermission permission : activePermissions) {
                recordPermissionService.revokePermissionImmediately(permission.getId(), userId);
            }

            // Delete file
            if (record.getFilePath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(record.getFilePath()));
                } catch (Exception e) {
                    logger.warn("Could not delete file: " + record.getFilePath(), e);
                }
            }

            medicalRecordRepository.delete(record);

            return ResponseEntity.ok(Map.of(
                    "message", "Medical record deleted successfully",
                    "revokedPermissions", activePermissions.size()
            ));

        } catch (Exception e) {
            logger.error("Error deleting medical record: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete medical record"));
        }
    }

    // ✅ SIMPLE: Accept permissionId as path parameter instead of request body
    @PostMapping("/records/revoke-permission/{userId}/{permissionId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> revokePermissionByPath(@PathVariable Long userId,
                                                                      @PathVariable Long permissionId) {
        try {
            logger.info("Revoke request received for user {} and permission {}", userId, permissionId);

            boolean revoked = recordPermissionService.revokePermissionImmediately(permissionId, userId);

            if (revoked) {
                logger.info("Successfully revoked permission {} for user {}", permissionId, userId);
                return ResponseEntity.ok(Map.of(
                        "message", "Permission revoked immediately",
                        "revokedAt", LocalDateTime.now(),
                        "doctorNotified", true
                ));
            } else {
                logger.warn("Failed to revoke permission {} for user {} - permission not found or already revoked", permissionId, userId);
                return ResponseEntity.badRequest().body(Map.of("error", "Permission not found or already revoked"));
            }

        } catch (Exception e) {
            logger.error("Error revoking permission {} for user {}: {}", permissionId, userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to revoke permission"));
        }
    }



}
