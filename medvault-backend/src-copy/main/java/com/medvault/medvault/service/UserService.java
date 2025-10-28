package com.medvault.medvault.service;

import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.*;
import com.medvault.medvault.dto.UserRegistrationRequest;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Data
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        // Generate temporary password
        String tempPassword = generateTemporaryPassword();

        // Create user (authentication record)
        User user = new User();
        user.setUsername(request.getEmail()); // Username = Email
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        user.setFirstLogin(true);

        // Save user first
        User savedUser = userRepository.save(user);

        // Create role-specific record
        if (savedUser.getRole() == Role.DOCTOR) {
            createDoctorRecord(savedUser.getId(), request);
        } else if (savedUser.getRole() == Role.PATIENT) {
            createPatientRecord(savedUser.getId(), request);
        }

        // ✨ FIX: Call the new, improved email method
        // Send credentials via the professional HTML email template
        emailService.sendRequestApproval(
                user.getEmail(),
                request.getFirstName(), // Pass the first name for personalization
                user.getUsername(),
                tempPassword
        );

        return savedUser;
    }

    private void createDoctorRecord(Long userId, UserRegistrationRequest request) {
        Doctor doctor = new Doctor();
        doctor.setUserId(userId);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setContactNumber(request.getPhone());
        doctor.setQualification(request.getQualification() != null ? request.getQualification() : "MBBS");
        doctor.setYearsOfExperience(request.getExperienceYears());

        doctorRepository.save(doctor);
    }

    private void createPatientRecord(Long userId, UserRegistrationRequest request) {
        Patient patient = new Patient();
        patient.setUserId(userId);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setContactNumber(request.getPhone());
        patient.setAddress(request.getAddress() != null ? request.getAddress() : "Not Provided");
        patient.setEmergencyContact(request.getEmergencyContact());

        // Parse date of birth if provided
        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth(), DateTimeFormatter.ISO_LOCAL_DATE));
        }

        // Set gender if provided
        if (request.getGender() != null) {
            patient.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        }

        patientRepository.save(patient);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<Doctor> findDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }

    public Optional<Patient> findPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public boolean resetPassword(String username, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setFirstLogin(false);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}