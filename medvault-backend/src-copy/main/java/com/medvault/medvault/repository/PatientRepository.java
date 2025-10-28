
package com.medvault.medvault.repository;

import com.medvault.medvault.model.Patient;
import com.medvault.medvault.model.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    List<Patient> findByStatus(PatientStatus status);
    long count();
}
