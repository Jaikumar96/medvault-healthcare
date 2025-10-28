package com.medvault.medvault.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore // Prevent circular references
    private List<Appointment> appointments;

    @Column(name = "user_id", unique = true)
    private Long userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "contact_number")
    private String contactNumber;

    private String email;

    @Column(name = "qualification")
    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String specialization;

    @Column(name = "consultation_fees")
    private Double consultationFees;

    @Column(name = "languages_spoken")
    private String languagesSpoken;

    @Column(name = "medical_degree_certificate")
    private String medicalDegreeCertificate;

    @Column(name = "medical_license_number")
    private String medicalLicenseNumber;

    @Column(name = "government_id_path")
    private String governmentIdPath;

    @Column(name = "clinic_affiliation_path")
    private String clinicAffiliationPath;

    @Column(name = "documents_uploaded")
    private Boolean documentsUploaded = false;

    @Column(name = "profile_complete")
    private Boolean profileComplete = false;

    @Enumerated(EnumType.STRING)
    private DoctorStatus status = DoctorStatus.INACTIVE;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Set defaults if null
        if (documentsUploaded == null) documentsUploaded = false;
        if (profileComplete == null) profileComplete = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to check if doctor is fully verified
    public boolean isFullyVerified() {
        return Boolean.TRUE.equals(profileComplete) &&
                Boolean.TRUE.equals(documentsUploaded) &&
                status == DoctorStatus.APPROVED;
    }

    // Helper method to check document completeness
    public boolean hasAllRequiredDocuments() {
        return medicalDegreeCertificate != null && !medicalDegreeCertificate.trim().isEmpty() &&
                medicalLicenseNumber != null && !medicalLicenseNumber.trim().isEmpty() &&
                governmentIdPath != null && !governmentIdPath.trim().isEmpty();
    }
}
