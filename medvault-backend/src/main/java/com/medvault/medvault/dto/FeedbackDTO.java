
package com.medvault.medvault.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private String doctorName;
    private Integer rating;
    private String comment;
    private LocalDateTime feedbackDate;
    private Boolean isAnonymous;
    private LocalDateTime appointmentDate;
}