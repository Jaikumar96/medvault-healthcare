package com.medvault.medvault.dto;

import com.medvault.medvault.model.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientProfileRequest {
    private String firstName;
    private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String email;
    private String address;
    private String emergencyContact;
}
