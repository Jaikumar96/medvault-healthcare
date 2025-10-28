package com.medvault.medvault.repository;

import com.medvault.medvault.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecordPermissionRepository extends JpaRepository<RecordPermission, Long> {

    // ✅ EXISTING: Single method to find permissions (handles duplicates)
    @Query("SELECT rp FROM RecordPermission rp WHERE rp.patient = :patient AND rp.doctor = :doctor AND rp.medicalRecord = :medicalRecord ORDER BY rp.grantedAt DESC")
    List<RecordPermission> findByPatientAndDoctorAndMedicalRecordOrderByGrantedAtDesc(@Param("patient") Patient patient, @Param("doctor") Doctor doctor, @Param("medicalRecord") MedicalRecord medicalRecord);

    // Helper method to get the most recent permission
    default Optional<RecordPermission> findLatestByPatientAndDoctorAndMedicalRecord(Patient patient, Doctor doctor, MedicalRecord medicalRecord) {
        List<RecordPermission> permissions = findByPatientAndDoctorAndMedicalRecordOrderByGrantedAtDesc(patient, doctor, medicalRecord);
        return permissions.isEmpty() ? Optional.empty() : Optional.of(permissions.get(0));
    }

    // For backward compatibility with existing code
    default Optional<RecordPermission> findByPatientAndDoctorAndMedicalRecord(Patient patient, Doctor doctor, MedicalRecord medicalRecord) {
        return findLatestByPatientAndDoctorAndMedicalRecord(patient, doctor, medicalRecord);
    }

    // ✅ EXISTING methods
    List<RecordPermission> findByPatientAndDoctorAndIsGrantedTrue(Patient patient, Doctor doctor);
    List<RecordPermission> findByDoctorAndIsGrantedTrue(Doctor doctor);

    @Query("SELECT rp FROM RecordPermission rp WHERE rp.patient.id = :patientId AND rp.doctor.id = :doctorId AND rp.isGranted = true")
    List<RecordPermission> findByPatientIdAndDoctorIdAndIsGrantedTrue(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);

    @Query("SELECT mr FROM MedicalRecord mr JOIN RecordPermission rp ON mr.id = rp.medicalRecord.id WHERE rp.doctor.id = :doctorId AND rp.isGranted = true")
    List<MedicalRecord> findAccessibleRecordsByDoctor(@Param("doctorId") Long doctorId);

    List<RecordPermission> findByMedicalRecordAndIsGrantedTrue(MedicalRecord medicalRecord);

    @Query("SELECT COUNT(rp) FROM RecordPermission rp WHERE rp.doctor = :doctor AND rp.isGranted = true")
    Long countAccessibleRecordsByDoctor(@Param("doctor") Doctor doctor);

    // ✅ NEW: Enhanced queries for time-limited access
    @Query("SELECT rp FROM RecordPermission rp WHERE rp.patient = :patient AND rp.doctor = :doctor AND rp.isGranted = true AND rp.revokedAt IS NULL AND (rp.expiresAt IS NULL OR rp.expiresAt > :now)")
    List<RecordPermission> findActivePermissionsByPatientAndDoctor(@Param("patient") Patient patient, @Param("doctor") Doctor doctor, @Param("now") LocalDateTime now);

    @Query("SELECT rp FROM RecordPermission rp WHERE rp.doctor = :doctor AND rp.isGranted = true AND rp.revokedAt IS NULL AND (rp.expiresAt IS NULL OR rp.expiresAt > :now)")
    List<RecordPermission> findActivePermissionsByDoctor(@Param("doctor") Doctor doctor, @Param("now") LocalDateTime now);

    @Query("SELECT rp FROM RecordPermission rp WHERE rp.patient.id = :patientId AND rp.doctor.id = :doctorId AND rp.isGranted = true AND rp.revokedAt IS NULL AND (rp.expiresAt IS NULL OR rp.expiresAt > :now)")
    List<RecordPermission> findActivePermissionsByPatientIdAndDoctorId(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId, @Param("now") LocalDateTime now);

    // ✅ NEW: Get accessible records with active permissions only
    @Query("SELECT mr FROM MedicalRecord mr JOIN RecordPermission rp ON mr.id = rp.medicalRecord.id WHERE rp.doctor.id = :doctorId AND rp.isGranted = true AND rp.revokedAt IS NULL AND (rp.expiresAt IS NULL OR rp.expiresAt > :now)")
    List<MedicalRecord> findAccessibleRecordsByDoctorActive(@Param("doctorId") Long doctorId, @Param("now") LocalDateTime now);

    // ✅ NEW: Find expired permissions for auto-cleanup
    @Query("SELECT rp FROM RecordPermission rp WHERE rp.isGranted = true AND rp.revokedAt IS NULL AND rp.expiresAt IS NOT NULL AND rp.expiresAt <= :now")
    List<RecordPermission> findExpiredPermissions(@Param("now") LocalDateTime now);

    // ✅ FIXED: Auto-revoke expired permissions (ADDED @Modifying)
    @Modifying
    @Transactional
    @Query("UPDATE RecordPermission rp SET rp.isGranted = false, rp.revokedAt = :now WHERE rp.isGranted = true AND rp.revokedAt IS NULL AND rp.expiresAt IS NOT NULL AND rp.expiresAt <= :now")
    int autoRevokeExpiredPermissions(@Param("now") LocalDateTime now);

    // ✅ NEW: Find permissions expiring soon (for notifications)
    @Query("SELECT rp FROM RecordPermission rp WHERE rp.isGranted = true AND rp.revokedAt IS NULL AND rp.expiresAt IS NOT NULL AND rp.expiresAt BETWEEN :now AND :warningTime")
    List<RecordPermission> findPermissionsExpiringSoon(@Param("now") LocalDateTime now, @Param("warningTime") LocalDateTime warningTime);

    // ✅ NEW: Count active records
    @Query("SELECT COUNT(rp) FROM RecordPermission rp WHERE rp.doctor = :doctor AND rp.isGranted = true AND rp.revokedAt IS NULL AND (rp.expiresAt IS NULL OR rp.expiresAt > :now)")
    Long countActiveRecordsByDoctor(@Param("doctor") Doctor doctor, @Param("now") LocalDateTime now);
}
