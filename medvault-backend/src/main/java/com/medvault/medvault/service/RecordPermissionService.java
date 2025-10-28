package com.medvault.medvault.service;

import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecordPermissionService {

    private static final Logger logger = LoggerFactory.getLogger(RecordPermissionService.class);

    @Autowired
    private RecordPermissionRepository recordPermissionRepository;

    @Autowired
    private EmailService emailService;

    // ✅ FIXED: Granular permission method with proper constructor
    @Transactional
    public RecordPermission grantGranularPermission(Patient patient, Doctor doctor, MedicalRecord record,
                                                    String permissionType, List<String> sharedFields,
                                                    Integer durationHours) {

        // Check if permission already exists
        Optional<RecordPermission> existingOpt = recordPermissionRepository
                .findLatestByPatientAndDoctorAndMedicalRecord(patient, doctor, record);

        RecordPermission permission;
        if (existingOpt.isPresent()) {
            permission = existingOpt.get();
            permission.setIsGranted(true);
            permission.setRevokedAt(null);
        } else {
            // ✅ FIXED: Use default constructor, then set fields
            permission = new RecordPermission();
            permission.setPatient(patient);
            permission.setDoctor(doctor);
            permission.setMedicalRecord(record);
            permission.setPermissionType(permissionType);
        }

        // Set granular sharing
        if (sharedFields != null && !sharedFields.isEmpty()) {
            permission.setSharedFields(String.join(",", sharedFields));
        }

        // Set time-limited access
        if (durationHours != null && durationHours > 0) {
            permission.setAccessDurationHours(durationHours);
            permission.setAutoRevokeEnabled(true);
        } else {
            permission.setAccessDurationHours(24); // Default 24 hours
            permission.setAutoRevokeEnabled(true);
        }

        permission.setPermissionType(permissionType);
        permission.setIsGranted(true);
        permission.setGrantedAt(LocalDateTime.now());

        // Set expiry time based on duration
        if (permission.getAutoRevokeEnabled() && permission.getAccessDurationHours() != null) {
            permission.setExpiresAt(LocalDateTime.now().plusHours(permission.getAccessDurationHours()));
        }

        return recordPermissionRepository.save(permission);
    }

    // ✅ Immediate revoke method
    @Transactional
    public boolean revokePermissionImmediately(Long permissionId, Long userId) {
        try {
            // ✅ FIXED: Find the permission by ID first
            Optional<RecordPermission> permissionOpt = recordPermissionRepository.findById(permissionId);
            if (permissionOpt.isEmpty()) {
                logger.warn("Permission not found with ID: {}", permissionId);
                return false;
            }

            RecordPermission permission = permissionOpt.get();

            // ✅ SECURITY: Verify the permission belongs to the patient making the request
            if (!permission.getPatient().getUserId().equals(userId)) {
                logger.warn("Permission {} does not belong to user {}", permissionId, userId);
                return false;
            }

            // ✅ CHECK: Make sure permission is currently granted
            if (!permission.getIsGranted()) {
                logger.warn("Permission {} is already revoked", permissionId);
                return false;
            }

            // ✅ REVOKE: Update the permission
            permission.setIsGranted(false);
            permission.setRevokedAt(LocalDateTime.now());
            recordPermissionRepository.save(permission);

            // ✅ NOTIFY: Send email to doctor (optional)
            try {
                emailService.sendRecordAccessRevokedNotification(
                        permission.getDoctor().getEmail(),
                        permission.getDoctor().getFirstName(),
                        permission.getPatient().getFirstName() + " " + permission.getPatient().getLastName(),
                        permission.getMedicalRecord().getTitle()
                );
            } catch (Exception e) {
                logger.warn("Failed to send revocation email: {}", e.getMessage());
                // Don't fail the revocation if email fails
            }

            logger.info("Successfully revoked permission {} for user {}", permissionId, userId);
            return true;

        } catch (Exception e) {
            logger.error("Error revoking permission {} for user {}: {}", permissionId, userId, e.getMessage(), e);
            return false;
        }
    }

    // ✅ FIXED: Auto-revoke scheduled task
    @Scheduled(fixedRate = 900000) // 15 minutes
    @Transactional
    public void autoRevokeExpiredPermissions() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int revokedCount = recordPermissionRepository.autoRevokeExpiredPermissions(now);

            if (revokedCount > 0) {
                logger.info("Auto-revoked {} expired permissions at {}", revokedCount, now);
            }
        } catch (Exception e) {
            logger.error("Error during auto-revoke of expired permissions: {}", e.getMessage(), e);
        }
    }

    // ✅ NEW: Send expiry warnings
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void sendExpiryWarnings() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime warningTime = now.plusHours(2); // Warn 2 hours before expiry

            List<RecordPermission> expiringSoon = recordPermissionRepository.findPermissionsExpiringSoon(now, warningTime);

            for (RecordPermission permission : expiringSoon) {
                try {
                    long hoursRemaining = getHoursRemaining(permission);

                    // Send notification to doctor
                    emailService.sendAccessExpiryWarning(
                            permission.getDoctor().getEmail(),
                            permission.getDoctor().getFirstName(),
                            permission.getPatient().getFirstName() + " " + permission.getPatient().getLastName(),
                            permission.getMedicalRecord().getTitle(),
                            hoursRemaining
                    );

                    logger.info("Sent expiry warning for permission ID: {} (expires in {} hours)",
                            permission.getId(), hoursRemaining);

                } catch (Exception e) {
                    logger.error("Error sending expiry warning for permission ID: {}", permission.getId(), e);
                }
            }

        } catch (Exception e) {
            logger.error("Error during expiry warning notifications: {}", e.getMessage(), e);
        }
    }

    // ✅ Helper method to calculate hours remaining
    private long getHoursRemaining(RecordPermission permission) {
        if (permission.getExpiresAt() == null) return -1;
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(permission.getExpiresAt())) return 0;
        return java.time.Duration.between(now, permission.getExpiresAt()).toHours();
    }

    // ✅ Check if doctor has active access to record
    public boolean hasActiveAccess(Doctor doctor, MedicalRecord record) {
        LocalDateTime now = LocalDateTime.now();
        List<RecordPermission> activePermissions = recordPermissionRepository
                .findActivePermissionsByPatientAndDoctor(record.getPatient(), doctor, now);

        return activePermissions.stream()
                .anyMatch(p -> p.getMedicalRecord().getId().equals(record.getId()));
    }

    // ✅ Get shared fields for permission
    public List<String> getSharedFields(RecordPermission permission) {
        if (permission.getSharedFields() == null || permission.getSharedFields().isEmpty()) {
            return List.of(); // Return empty list if no specific fields shared (full access)
        }
        return List.of(permission.getSharedFields().split(","));
    }
}
