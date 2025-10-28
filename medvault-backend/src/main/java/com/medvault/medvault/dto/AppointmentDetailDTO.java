// src/main/java/com/medvault/medvault/dto/AppointmentDetailDTO.java

package com.medvault.medvault.dto;

import com.medvault.medvault.model.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AppointmentDetailDTO {
    private Long id;
    private AppointmentStatus status;
    private String patientNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;

    // Flattened Patient Info
    private Long patientId;
    private String patientFirstName;
    private String patientLastName;

    // Flattened TimeSlot Info
    private Long slotId;
    private LocalDateTime appointmentStartTime;
    private LocalDateTime appointmentEndTime;

    private Map<String, String> patient;

}