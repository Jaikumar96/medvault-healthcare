// src/main/java/com/medvault/medvault/dto/TimeSlotRequest.java
package com.medvault.medvault.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TimeSlotRequest {
    // These might not be sent directly anymore if calculated from duration
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // ✨ NEW FIELDS FROM ENHANCED FORM ✨
    private Integer duration;
    private String appointmentType;
    private Integer bufferTime;
    private Boolean isRecurring;
    private List<String> recurringDays; // e.g., ["MONDAY", "WEDNESDAY"]
    private String recurringEndDate;    // e.g., "2025-12-31"
}