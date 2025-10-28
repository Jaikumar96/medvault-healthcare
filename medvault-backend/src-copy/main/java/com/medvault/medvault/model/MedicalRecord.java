package com.medvault.medvault.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "record_type", nullable = false)
    private String recordType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ✅ NEW FIELDS for enhanced medical records
    @Column(name = "blood_group")
    private String bloodGroup; // A+, A-, B+, B-, O+, O-, AB+, AB-

    @Column(name = "blood_pressure")
    private String bloodPressure; // e.g., "120/80"

    @Column(name = "heart_rate")
    private Integer heartRate; // BPM

    @Column(name = "temperature")
    private Double temperature; // in Celsius

    @Column(name = "weight")
    private Double weight; // in kg

    @Column(name = "diagnosis_condition")
    private String diagnosisCondition; // Dropdown values

    @Column(name = "medication", columnDefinition = "TEXT")
    private String medication; // Prescribed medicines

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RecordPermission> permissions;

    // Getters, setters, and constructors...
}
