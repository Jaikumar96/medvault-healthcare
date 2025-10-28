package com.medvault.medvault.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class RescheduleRequest {
    private Long appointmentId;
    private Long newSlotId;
    private String reason;
}