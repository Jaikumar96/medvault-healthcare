package com.medvault.medvault.service;

import com.medvault.medvault.model.TimeSlot;
import com.medvault.medvault.repository.TimeSlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Component
public class SlotCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(SlotCleanupService.class);

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    // Run every hour
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    public void cleanupExpiredSlots() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<TimeSlot> expiredSlots = timeSlotRepository.findByIsAvailableAndStartTimeBefore(true, now);

            if (!expiredSlots.isEmpty()) {
                timeSlotRepository.deleteAll(expiredSlots);
                logger.info("Automatically cleaned up {} expired time slots", expiredSlots.size());
            }
        } catch (Exception e) {
            logger.error("Error in automatic slot cleanup: {}", e.getMessage(), e);
        }
    }
}
