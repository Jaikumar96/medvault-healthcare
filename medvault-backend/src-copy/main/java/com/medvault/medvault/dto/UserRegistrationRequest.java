package com.medvault.medvault.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class UserRegistrationRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String password;

    // Doctor-specific fields
    private String specialization;
    private String qualification;
    private Integer experienceYears;

    // Patient-specific fields
    private String dateOfBirth;
    private String gender;
    private String address;
    private String emergencyContact;



}
