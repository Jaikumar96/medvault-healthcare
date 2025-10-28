// Create PatientStatus.java
package com.medvault.medvault.model;

public enum PatientStatus {
    INACTIVE,   // Profile incomplete or no document uploaded
    PENDING,    // Document uploaded, awaiting admin review
    APPROVED,   // Admin approved
    REJECTED    // Admin rejected
}
