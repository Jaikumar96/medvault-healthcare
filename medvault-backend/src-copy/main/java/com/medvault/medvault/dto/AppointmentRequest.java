package com.medvault.medvault.dto;

import lombok.Data;

@Data

public class AppointmentRequest {
    private Long doctorId;
    private Long slotId;
    private String patientNotes;
}
