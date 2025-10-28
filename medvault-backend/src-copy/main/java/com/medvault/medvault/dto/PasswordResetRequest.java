package com.medvault.medvault.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class PasswordResetRequest {
    private String username;
    private String oldPassword;
    private String newPassword;

}