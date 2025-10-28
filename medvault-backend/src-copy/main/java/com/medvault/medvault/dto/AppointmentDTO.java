package com.medvault.medvault.dto;

import com.medvault.medvault.model.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDTO {
    private Long id;
    private AppointmentStatus status;
    private String patientNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long doctorId;

    // Doctor details
    private String doctorName;
    private String doctorSpecialization;
    private String doctorContact;
    private Double consultationFees;

    // Slot details
    private LocalDateTime appointmentStartTime;
    private LocalDateTime appointmentEndTime;
}
