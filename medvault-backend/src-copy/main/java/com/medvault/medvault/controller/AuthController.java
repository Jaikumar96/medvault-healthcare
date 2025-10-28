package com.medvault.medvault.controller;

import com.medvault.medvault.dto.LoginRequest;
import com.medvault.medvault.dto.PasswordResetRequest;
import com.medvault.medvault.dto.UserRegistrationRequest;
import com.medvault.medvault.model.Doctor;
import com.medvault.medvault.model.Patient;
import com.medvault.medvault.model.Role;
import com.medvault.medvault.model.User;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();

        // Check if user is enabled
        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Account has been disabled. Please contact administrator."
            ));
        }

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        // Role-specific info
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole());
        userInfo.put("firstLogin", user.getFirstLogin());
        userInfo.put("enabled", user.isEnabled());

        if (user.getRole() == Role.DOCTOR) {
            userService.findDoctorByUserId(user.getId()).ifPresent(doctor -> {
                userInfo.put("firstName", doctor.getFirstName());
                userInfo.put("lastName", doctor.getLastName());
                userInfo.put("specialization", doctor.getSpecialization());
            });
        } else if (user.getRole() == Role.PATIENT) {
            userService.findPatientByUserId(user.getId()).ifPresent(patient -> {
                userInfo.put("firstName", patient.getFirstName());
                userInfo.put("lastName", patient.getLastName());
            });
        } else {
            // Admin user
            userInfo.put("firstName", "Admin");
            userInfo.put("lastName", "User");
        }

        // Generate JWT token (replace with real implementation)
        String token = generateJWTToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully. Credentials sent via email.",
                    "userId", user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Registration failed: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        boolean success = userService.resetPassword(
                request.getUsername(),
                request.getOldPassword(),
                request.getNewPassword()
        );

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Password reset failed"));
        }
    }

    private String generateJWTToken(User user) {

        return "jwt_token_" + user.getId() + "_" + System.currentTimeMillis();
    }
}
