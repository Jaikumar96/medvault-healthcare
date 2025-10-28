
package com.medvault.medvault.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TimeSlotRequest {

    private LocalDateTime startTime;
    private LocalDateTime endTime;


    private Integer duration;
    private String appointmentType;
    private Integer bufferTime;
    private Boolean isRecurring;
    private List<String> recurringDays;
    private String recurringEndDate;
}