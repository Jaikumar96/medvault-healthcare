package com.medvault.medvault.controller;

import com.medvault.medvault.dto.UserRegistrationRequest;
import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.UserRepository;
import com.medvault.medvault.repository.DoctorRepository;
import com.medvault.medvault.repository.PatientRepository;
import com.medvault.medvault.repository.AccessRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.medvault.medvault.repository.PatientRepository;


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;




import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RestController
@RequestMapping("/api/admin")

public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/user-stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            long totalUsers = userRepository.count();
            long totalDoctors = doctorRepository.count();
            long totalPatients = patientRepository.count();
            long totalAdmins = userRepository.countByRole(Role.ADMIN);
            long pendingRequests = accessRequestRepository.countByStatus(RequestStatus.PENDING);

            // Fix: Use LocalDateTime directly
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);

            long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

            stats.put("totalUsers", totalUsers);
            stats.put("totalDoctors", totalDoctors);
            stats.put("totalPatients", totalPatients);
            stats.put("totalAdmins", totalAdmins);
            stats.put("newUsersThisMonth", newUsersThisMonth);
            stats.put("pendingRequests", pendingRequests);

            logger.info("Stats successfully created: " + stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error in getUserStats: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            // Create User entity (NOT Doctor entity)
            User user = new User();
            user.setUsername(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());

            // Convert string role to enum
            try {
                Role role = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + request.getRole()));
            }

            // Generate default password if not provided
            String password = (request.getPassword() != null && !request.getPassword().isEmpty())
                    ? request.getPassword()
                    : generateDefaultPassword();

            user.setPassword(passwordEncoder.encode(password));
            user.setEnabled(true);
            user.setCreatedAt(LocalDateTime.now());

            // Save user
            userRepository.save(user);

            Map<String, Object> response = Map.of(
                    "message", "User registered successfully",
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "temporaryPassword", password
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    private String generateDefaultPassword() {
        return "TempPass" + UUID.randomUUID().toString().substring(0, 6);
    }


    @GetMapping("/recent-activities")
    public ResponseEntity<Map<String, Object>> getRecentActivities() {
        try {
            Map<String, Object> activities = new HashMap<>();

            // Fix: Use LocalDateTime directly
            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
            List<Object[]> recentUsers = userRepository.findRecentUsers(weekAgo);
            activities.put("recentUsers", recentUsers);

            List<Object[]> recentRequests = accessRequestRepository.findRecentRequests(5);
            activities.put("recentRequests", recentRequests);

            logger.info("Recent activities fetched successfully");
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            logger.error("Error in getRecentActivities: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();

            // Monthly registration stats for User Growth chart
            List<Object[]> monthlyStats = userRepository.getMonthlyRegistrationStats();
            analytics.put("monthlyRegistrations", monthlyStats);

            // Role distribution
            Map<String, Long> roleDistribution = new HashMap<>();
            roleDistribution.put("ADMIN", userRepository.countByRole(Role.ADMIN));
            roleDistribution.put("DOCTOR", userRepository.countByRole(Role.DOCTOR));
            roleDistribution.put("PATIENT", userRepository.countByRole(Role.PATIENT));
            analytics.put("roleDistribution", roleDistribution);

            // Request status distribution
            Map<String, Long> requestStatusDistribution = new HashMap<>();
            requestStatusDistribution.put("PENDING", accessRequestRepository.countByStatus(RequestStatus.PENDING));
            requestStatusDistribution.put("APPROVED", accessRequestRepository.countByStatus(RequestStatus.APPROVED));
            requestStatusDistribution.put("REJECTED", accessRequestRepository.countByStatus(RequestStatus.REJECTED));
            analytics.put("requestStatusDistribution", requestStatusDistribution);

            logger.info("Analytics data fetched successfully");
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error in getAnalytics: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // User Management APIs
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            logger.info("Fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching users: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userRepository.findById(id);
            return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error fetching user by ID: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());

            User updatedUser = userRepository.save(user);
            logger.info("Updated user with ID: {}", id);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating user: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            userRepository.deleteById(id);
            logger.info("Deleted user with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting user: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/users/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableUser(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            user.setEnabled(true);
            userRepository.save(user);

            logger.info("Enabled user with ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "User enabled successfully"));
        } catch (Exception e) {
            logger.error("Error enabling user: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to enable user"));
        }
    }

    @PostMapping("/users/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disableUser(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Prevent admin from disabling themselves
            String currentUsername = getCurrentUsername(); // Implement this method
            if (user.getUsername().equals(currentUsername)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot disable your own account"));
            }

            user.setEnabled(false);
            userRepository.save(user);

            logger.info("Disabled user with ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "User disabled successfully"));
        } catch (Exception e) {
            logger.error("Error disabling user: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to disable user"));
        }
    }

    // Helper method to get current user's username
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }


    private ResponseEntity<?> toggleUserStatus(Long id, boolean enabled) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            // Note: You might need to add an 'enabled' field to your User entity
            // user.setEnabled(enabled);
            userRepository.save(user);

            logger.info("Toggled user status for ID: {} to {}", id, enabled);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error toggling user status: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            logger.error("Error fetching doctors: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/doctors/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveDoctor(@PathVariable Long id,
                                                             @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(id);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            doctor.setStatus(DoctorStatus.APPROVED);
            if (requestBody != null && requestBody.get("notes") != null) {
                doctor.setAdminNotes(requestBody.get("notes"));
            }
            doctorRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor approved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error approving doctor: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/doctors/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectDoctor(@PathVariable Long id,
                                                            @RequestBody Map<String, String> requestBody) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(id);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            doctor.setStatus(DoctorStatus.REJECTED);
            doctor.setAdminNotes(requestBody.get("notes"));
            doctorRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor rejected successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rejecting doctor: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/doctors/{id}/document/{documentType}")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long id, @PathVariable String documentType) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(id);
            if (doctorOpt.isEmpty()) {
                logger.error("Doctor not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }

            Doctor doctor = doctorOpt.get();
            String filePath = null;

            switch (documentType) {
                case "medicalDegree":
                    filePath = doctor.getMedicalDegreeCertificate();
                    break;
                case "governmentId":
                    filePath = doctor.getGovernmentIdPath();
                    break;
                case "clinicAffiliation":
                    filePath = doctor.getClinicAffiliationPath();
                    break;
                default:
                    logger.error("Invalid document type: " + documentType);
                    return ResponseEntity.badRequest().build();
            }

            if (filePath == null || filePath.isEmpty()) {
                logger.error("Document path is null for type: " + documentType + ", doctorId: " + id);
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                logger.error("File does not exist at path: " + filePath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            logger.info("Serving document: " + path.getFileName() + " with content type: " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + path.getFileName().toString() + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error viewing document for doctorId: " + id + ", type: " + documentType, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            logger.error("Error fetching patients: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/patients/{id}/approve")
    public ResponseEntity<Map<String, Object>> approvePatient(@PathVariable Long id,
                                                              @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Optional<Patient> patientOpt = patientRepository.findById(id);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Patient patient = patientOpt.get();
            patient.setStatus(PatientStatus.APPROVED);
            if (requestBody != null && requestBody.get("notes") != null) {
                patient.setAdminNotes(requestBody.get("notes"));
            }
            patientRepository.save(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Patient approved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error approving patient: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/patients/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectPatient(@PathVariable Long id,
                                                             @RequestBody Map<String, String> requestBody) {
        try {
            Optional<Patient> patientOpt = patientRepository.findById(id);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Patient patient = patientOpt.get();
            patient.setStatus(PatientStatus.REJECTED);
            patient.setAdminNotes(requestBody.get("notes"));
            patientRepository.save(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Patient rejected successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rejecting patient: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/patients/{id}/document")
    public ResponseEntity<Resource> viewPatientDocument(@PathVariable Long id) {
        try {
            Optional<Patient> patientOpt = patientRepository.findById(id);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Patient patient = patientOpt.get();
            String filePath = patient.getGovernmentIdPath();

            if (filePath == null || filePath.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + path.getFileName().toString() + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error viewing patient document: " + e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

}
