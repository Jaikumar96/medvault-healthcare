package com.medvault.medvault.repository;

import com.medvault.medvault.model.MedicalRecord;
import com.medvault.medvault.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientOrderByUploadedAtDesc(Patient patient);
    List<MedicalRecord> findByPatientAndRecordType(Patient patient, String recordType);

    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.patient.id = :patientId")
    List<MedicalRecord> findByPatientId(@Param("patientId") Long patientId);
}
