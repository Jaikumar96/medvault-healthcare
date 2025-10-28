package com.medvault.medvault.repository;

import com.medvault.medvault.model.Doctor;
import com.medvault.medvault.model.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findByStatus(DoctorStatus status);
    long countByStatus(DoctorStatus status);
}
