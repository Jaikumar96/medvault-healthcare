// FeedbackRepository.java
package com.medvault.medvault.repository;

import com.medvault.medvault.model.Feedback;
import com.medvault.medvault.model.Doctor;
import com.medvault.medvault.model.Patient;
import com.medvault.medvault.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByDoctorOrderByFeedbackDateDesc(Doctor doctor);
    Optional<Feedback> findByAppointment(Appointment appointment);
    List<Feedback> findByPatientOrderByFeedbackDateDesc(Patient patient);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.doctor = :doctor")
    Double getAverageRatingByDoctor(@Param("doctor") Doctor doctor);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.doctor = :doctor")
    Long getTotalFeedbackCountByDoctor(@Param("doctor") Doctor doctor);
}
