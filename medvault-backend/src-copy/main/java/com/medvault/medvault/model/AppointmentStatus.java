package com.medvault.medvault.model;

public enum AppointmentStatus {
    PENDING,    // Awaiting doctor approval
    APPROVED,   // Doctor approved
    REJECTED,   // Doctor rejected
    COMPLETED,  // Appointment completed
    CANCELLED   // Cancelled by patient or doctor
}
