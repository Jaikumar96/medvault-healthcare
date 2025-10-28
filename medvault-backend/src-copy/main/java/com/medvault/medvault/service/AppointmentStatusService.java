package com.medvault.medvault.service;

import com.medvault.medvault.model.Appointment;
import com.medvault.medvault.model.AppointmentStatus;
import com.medvault.medvault.model.TimeSlot;
import com.medvault.medvault.repository.AppointmentRepository;
import com.medvault.medvault.repository.TimeSlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentStatusService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentStatusService.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void updateCompletedAppointments() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Appointment> approvedAppointments = appointmentRepository.findByStatus(AppointmentStatus.APPROVED);

            int completedCount = 0;
            for (Appointment appointment : approvedAppointments) {
                // ✅ FIXED: Add proper null checks
                if (appointment.getSlotId() != null) {
                    Optional<TimeSlot> slotOpt = timeSlotRepository.findById(appointment.getSlotId());
                    if (slotOpt.isPresent()) {
                        TimeSlot slot = slotOpt.get();

                        // If appointment end time has passed, mark as completed
                        if (slot.getEndTime() != null && slot.getEndTime().isBefore(now)) {
                            appointment.setStatus(AppointmentStatus.COMPLETED);
                            appointmentRepository.save(appointment);
                            completedCount++;
                            logger.info("Marked appointment {} as completed", appointment.getId());
                        }
                    } else {
                        logger.warn("TimeSlot not found for appointment {}, slotId: {}", appointment.getId(), appointment.getSlotId());
                    }
                } else {
                    logger.warn("Appointment {} has null slotId", appointment.getId());
                }
            }

            if (completedCount > 0) {
                logger.info("Updated {} appointments to completed status", completedCount);
            }

            // Also cleanup expired available slots
            cleanupExpiredSlots();

        } catch (Exception e) {
            logger.error("Error updating completed appointments: {}", e.getMessage(), e);
        }
    }

    public int manuallyUpdateCompletedAppointments() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Appointment> approvedAppointments = appointmentRepository.findByStatus(AppointmentStatus.APPROVED);

            int completedCount = 0;
            for (Appointment appointment : approvedAppointments) {
                if (appointment.getSlotId() != null) {
                    Optional<TimeSlot> slotOpt = timeSlotRepository.findById(appointment.getSlotId());
                    if (slotOpt.isPresent()) {
                        TimeSlot slot = slotOpt.get();

                        if (slot.getEndTime() != null && slot.getEndTime().isBefore(now)) {
                            appointment.setStatus(AppointmentStatus.COMPLETED);
                            appointmentRepository.save(appointment);
                            completedCount++;
                        }
                    }
                }
            }

            logger.info("Manually completed {} appointments", completedCount);
            return completedCount;

        } catch (Exception e) {
            logger.error("Error in manual completion update: {}", e.getMessage(), e);
            return 0;
        }
    }

    private void cleanupExpiredSlots() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<TimeSlot> expiredSlots = timeSlotRepository.findByIsAvailableAndStartTimeBefore(true, now);

            if (!expiredSlots.isEmpty()) {
                timeSlotRepository.deleteAll(expiredSlots);
                logger.info("Cleaned up {} expired time slots", expiredSlots.size());
            }

        } catch (Exception e) {
            logger.error("Error cleaning up expired slots: {}", e.getMessage(), e);
        }
    }
}
