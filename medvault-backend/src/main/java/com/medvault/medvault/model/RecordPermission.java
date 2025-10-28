package com.medvault.medvault.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "record_permissions")
public class RecordPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "permission_type", nullable = false)
    private String permissionType; // READ, WRITE, FULL_ACCESS

    @Column(name = "is_granted", nullable = false)
    private Boolean isGranted = false;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    // ✅ NEW FIELDS for time-limited access
    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // 24-hour default expiry

    @Column(name = "access_duration_hours")
    private Integer accessDurationHours = 24; // Default 24 hours

    @Column(name = "auto_revoke_enabled")
    private Boolean autoRevokeEnabled = true;

    @Column(name = "shared_fields", columnDefinition = "TEXT")
    private String sharedFields; // JSON string of specific fields shared

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return isGranted && !isExpired() && revokedAt == null;
    }

    public long getHoursRemaining() {
        if (expiresAt == null) return -1;
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(expiresAt)) return 0;
        return java.time.Duration.between(now, expiresAt).toHours();
    }

    // Getters and setters...
}
