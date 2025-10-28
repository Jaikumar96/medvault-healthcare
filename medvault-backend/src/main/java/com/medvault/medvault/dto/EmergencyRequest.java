package com.medvault.medvault.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class EmergencyRequest {
    private String urgencyLevel; // HIGH, MEDIUM, LOW
    private String symptoms;
    private String patientNotes;
    private String contactNumber;

}
