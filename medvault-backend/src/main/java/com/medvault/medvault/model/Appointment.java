package com.medvault.medvault.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "appointment_slots")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", referencedColumnName = "id")
    @JsonBackReference("patient-appointments") // Prevents loop from patient
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id")
    @JsonBackReference("doctor-appointments") // Prevents loop from doctor
    private Doctor doctor;

    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Column(name = "patient_notes", columnDefinition = "TEXT")
    private String patientNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Add these fields to your existing Appointment model
    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "urgency_level")
    private String urgencyLevel;

    @Column(name = "reschedule_count")
    private Integer rescheduleCount = 0;

    @Column(name = "original_appointment_id")
    private Long originalAppointmentId;

    @Column(name = "reschedule_reason")
    private String rescheduleReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference("timeslot-appointments")
    private TimeSlot timeSlot;


}
