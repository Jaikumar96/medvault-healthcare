package com.medvault.medvault.repository;

import com.medvault.medvault.model.Appointment;
import com.medvault.medvault.model.AppointmentStatus;
import com.medvault.medvault.model.Doctor;
import com.medvault.medvault.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.medvault.medvault.model.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Existing methods
    List<Appointment> findByPatientOrderByCreatedAtDesc(Patient patient);
    List<Appointment> findByDoctorOrderByCreatedAtDesc(Doctor doctor);
    List<Appointment> findByPatientAndStatus(Patient patient, AppointmentStatus status);
    List<Appointment> findByDoctorAndStatus(Doctor doctor, AppointmentStatus status);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByDoctorAndSlotId(Doctor doctor, Long slotId);
    List<Appointment> findBySlotId(Long slotId);
    List<Appointment> findBySlotIdAndStatus(Long slotId, AppointmentStatus status);

    // Add these methods to your existing AppointmentRepository
    List<Appointment> findByIsEmergencyTrueAndDoctorIsNullAndStatus(AppointmentStatus status);



    // ✨ ADD THIS MISSING METHOD
    List<Appointment> findByPatientAndStatusOrderByCreatedAtDesc(Patient patient, AppointmentStatus status);
    List<Appointment> findByDoctorAndStatusOrderByCreatedAtDesc(Doctor doctor, AppointmentStatus status);

    /**
     * Counts appointments for a specific doctor with a given status.
     * Used for counting 'Pending Reviews' on the dashboard.
     */
    long countByDoctorAndStatus(Doctor doctor, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a JOIN TimeSlot ts ON a.slotId = ts.id " +
            "WHERE a.patient = :patient " +
            "AND a.status = :status " +
            "AND ts.startTime > :currentTime " +
            "ORDER BY ts.startTime ASC " +
            "LIMIT 1")
    Optional<Appointment> findFirstByPatientAndStatusAndAppointmentStartTimeAfterOrderByAppointmentStartTimeAsc(
            @Param("patient") Patient patient,
            @Param("status") AppointmentStatus status,
            @Param("currentTime") LocalDateTime currentTime);

    long countByPatientAndStatus(Patient patient, AppointmentStatus status);

    @Query("SELECT count(a) FROM Appointment a JOIN TimeSlot ts ON a.slotId = ts.id " +
            "WHERE a.doctor = :doctor AND a.status = :status AND ts.startTime BETWEEN :start AND :end")
    long countByDoctorAndStatusAndAppointmentTimeBetween(
            @Param("doctor") Doctor doctor,
            @Param("status") AppointmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor = :doctor")
    List<Patient> findDistinctPatientsByDoctor(@Param("doctor") Doctor doctor);

    @Query("SELECT count(DISTINCT a.patient) FROM Appointment a WHERE a.doctor = :doctor")
    long countDistinctPatientsByDoctor(@Param("doctor") Doctor doctor);
}
