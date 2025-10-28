package com.medvault.medvault.service;

import com.medvault.medvault.model.AccessRequest;
import com.medvault.medvault.model.RequestStatus;
import com.medvault.medvault.model.User;
import com.medvault.medvault.model.Role;
import com.medvault.medvault.repository.AccessRequestRepository;
import com.medvault.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccessRequestService {

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public AccessRequest submitRequest(AccessRequest request) {
        // Check if email already exists
        if (accessRequestRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Request already exists with this email");
        }

        // Also check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User account already exists with this email");
        }

        AccessRequest savedRequest = accessRequestRepository.save(request);

        // Send confirmation email
        emailService.sendRequestConfirmation(request.getEmail(), request.getFirstName());

        return savedRequest;
    }

    public List<AccessRequest> getAllRequests() {
        return accessRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AccessRequest> getPendingRequests() {
        return accessRequestRepository.findByStatus(RequestStatus.PENDING);
    }

    public Optional<AccessRequest> getRequestById(Long id) {
        return accessRequestRepository.findById(id);
    }

    public AccessRequest approveRequest(Long requestId, Long reviewerId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User account already exists with this email");
        }

        try {
            // Create user account
            User user = new User();
            user.setUsername(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());

            // Convert string to Role enum
            Role role = request.getRequestedRole();
            user.setRole(role);

            // Generate a temporary password
            String tempPassword = generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setEnabled(true);
            user.setCreatedAt(LocalDateTime.now());

            // Save the user
            userRepository.save(user);

            // Update request status
            request.setStatus(RequestStatus.APPROVED);
            request.setReviewedBy(reviewerId);
            request.setReviewedAt(LocalDateTime.now());

            AccessRequest updatedRequest = accessRequestRepository.save(request);

            // Send approval email with login credentials
            emailService.sendRequestApproval(
                    request.getEmail(),
                    request.getFirstName(),
                    request.getEmail(), // username
                    tempPassword
            );

            return updatedRequest;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create user account: " + e.getMessage());
        }
    }

    public AccessRequest rejectRequest(Long requestId, Long reviewerId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(LocalDateTime.now());

        AccessRequest updatedRequest = accessRequestRepository.save(request);

        // Send rejection email
        emailService.sendRequestRejection(request.getEmail(), request.getFirstName());

        return updatedRequest;
    }

    private String generateTemporaryPassword() {
        return "MedVault" + UUID.randomUUID().toString().substring(0, 6);
    }
}
