package com.medvault.medvault.repository;

import com.medvault.medvault.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctorId(Long doctorId);

    List<TimeSlot> findByDoctorIdAndIsAvailableAndStartTimeBefore(Long doctorId, Boolean isAvailable, LocalDateTime dateTime);

    List<TimeSlot> findByDoctorIdOrderByStartTimeAsc(Long doctorId);

    List<TimeSlot> findByDoctorIdAndIsAvailableTrue(Long doctorId);


    List<TimeSlot> findByIsAvailableAndStartTimeBefore(Boolean isAvailable, LocalDateTime dateTime);


    @Query("SELECT ts FROM TimeSlot ts WHERE ts.doctorId = :doctorId AND ts.isAvailable = true AND ts.startTime > :now ORDER BY ts.startTime ASC")
    List<TimeSlot> findAvailableSlotsByDoctor(@Param("doctorId") Long doctorId, @Param("now") LocalDateTime now);

    @Query("SELECT ts FROM TimeSlot ts WHERE ts.doctorId = :doctorId AND " +
            "((ts.startTime BETWEEN :startTime AND :endTime) OR " +
            "(ts.endTime BETWEEN :startTime AND :endTime) OR " +
            "(ts.startTime <= :startTime AND ts.endTime >= :endTime))")
    List<TimeSlot> findByDoctorIdAndTimeOverlap(@Param("doctorId") Long doctorId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);


    @Query("SELECT t FROM TimeSlot t WHERE t.doctorId = ?1 AND t.isAvailable = true")
    List<TimeSlot> findAvailableSlotsByDoctorId(Long doctorId);

    @Query("SELECT t FROM TimeSlot t WHERE t.doctorId = ?1 AND t.startTime >= ?2 AND t.endTime <= ?3")
    List<TimeSlot> findByDoctorIdAndDateRange(Long doctorId, LocalDateTime startDate, LocalDateTime endDate);
}
