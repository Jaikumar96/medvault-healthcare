package com.medvault.medvault.dto;

import java.time.LocalDateTime;

public class RescheduleRequest {
    private Long appointmentId;
    private Long newSlotId;
    private String reason;

    // Getters and setters
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public Long getNewSlotId() { return newSlotId; }
    public void setNewSlotId(Long newSlotId) { this.newSlotId = newSlotId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
