// service/EmailService.java
package com.medvault.medvault.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter HUMAN_READABLE_FORMAT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Autowired
    private JavaMailSender mailSender;

    // It's best practice to configure these in your application.properties
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.url}") // e.g., app.url=http://localhost:5173
    private String appBaseUrl;

    /**
     * Sends a generic HTML email using a standardized template.
     *
     * @param to The recipient's email address.
     * @param subject The email subject.
     * @param htmlContent The main content of the email in HTML format.
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("HTML email sent successfully to {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            // Depending on your application's needs, you might want to re-throw this as a custom exception
        }
    }

    /**
     * A private helper to wrap content in a consistent, branded HTML template.
     * @param title The main heading for the email content.
     * @param contentBody The HTML body of the message.
     * @return Full HTML document as a String.
     */
    private String createHtmlEmailTemplate(String title, String contentBody) {
        // Inline CSS is used for maximum compatibility with email clients.
        return String.format("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .header { color: #059669; font-size: 24px; font-weight: bold; text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;}
                .content { padding: 20px 0; color: #333333; line-height: 1.6; }
                .content-title { color: #1e40af; font-size: 20px; margin-bottom: 10px; }
                .info-box { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px;}
                .cta-button { display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">MedVault</div>
                <div class="content">
                    <h2 class="content-title">%s</h2>
                    %s
                </div>
                <div class="footer">
                    &copy; %d MedVault. All rights reserved.<br>
                    This is an automated message, please do not reply.
                </div>
            </div>
        </body>
        </html>
        """, title, contentBody, LocalDateTime.now().getYear());
    }


    public void sendRequestConfirmation(String email, String firstName) {
        String title = "We've Received Your Access Request";
        String body = String.format("""
            <p>Dear %s,</p>
            <p>Thank you for your interest in MedVault! We have successfully received your access request.</p>
            <p>Our team will review your information shortly. You will receive another email once your request has been processed.</p>
            <p>Best regards,<br>The MedVault Team</p>
            """, firstName);

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(email, "MedVault Access Request Received", htmlContent);
    }

    public void sendRequestRejection(String email, String firstName) {
        String title = "Update on Your MedVault Access Request";
        String body = String.format("""
            <p>Dear %s,</p>
            <p>Thank you for your interest in MedVault. After careful review, we are unable to approve your access request at this time.</p>
            <p>If you believe this is an error or have any questions, please contact our support team.</p>
            <p>We apologize for any inconvenience.</p>
            <p>Best regards,<br>The MedVault Team</p>
            """, firstName);

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(email, "MedVault Access Request Update", htmlContent);
    }

    public void sendRequestApproval(String email, String firstName, String username, String tempPassword) {
        String title = String.format("Welcome to MedVault, %s!", firstName);
        String body = String.format("""
            <p>Congratulations! Your access request has been approved.</p>
            <p>You can now log in to your secure healthcare portal. Here are your credentials:</p>
            
            <div class="info-box">
                <p><strong>Username:</strong> %s</p>
                <p><strong>Temporary Password:</strong> %s</p>
            </div>
            
            <p><strong>Important:</strong> For your security, you will be required to change your password after your first login.</p>
            
            <a href="%s" class="cta-button">Login to MedVault</a>
            
            <p>Thank you for joining MedVault!</p>
            <p>Best regards,<br>The MedVault Team</p>
            """, username, tempPassword, appBaseUrl);

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(email, "Welcome to MedVault - Your Account is Ready!", htmlContent);
    }


    public void sendSlotCreationNotification(String doctorEmail, String doctorName, LocalDateTime startTime, LocalDateTime endTime) {
        String title = "New Time Slot Created";
        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>Your new time slot has been created successfully and is now available for patient bookings.</p>
            <div class="info-box">
                <p><strong>Date:</strong> %s</p>
                <p><strong>From:</strong> %s</p>
                <p><strong>To:</strong> %s</p>
            </div>
            <p>You will receive notifications here as soon as appointments are booked for this slot.</p>
            <a href="%s/doctor/schedule" class="cta-button">View Your Schedule</a>
            """,
                doctorName,
                startTime.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
                startTime.format(DateTimeFormatter.ofPattern("h:mm a")),
                endTime.format(DateTimeFormatter.ofPattern("h:mm a")),
                appBaseUrl
        );

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "Time Slot Created Successfully - MedVault", htmlContent);
    }

    public void sendAppointmentNotificationToDoctor(String doctorEmail, String doctorName, String patientName, LocalDateTime appointmentTime) {
        String title = "New Appointment Request";
        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>You have received a new appointment request. Please review the details below and take action.</p>
            <div class="info-box">
                <p><strong>Patient:</strong> %s</p>
                <p><strong>Requested Date & Time:</strong> %s</p>
            </div>
            <p>Please log in to your MedVault dashboard to approve or decline this appointment.</p>
            <a href="%s/doctor/appointments" class="cta-button">Manage Appointments</a>
            """,
                doctorName,
                patientName,
                appointmentTime.format(HUMAN_READABLE_FORMAT),
                appBaseUrl
        );

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "New Appointment Request - MedVault", htmlContent);
    }



    public void sendAppointmentRejectionToPatient(String patientEmail, String patientName, String doctorName, LocalDateTime appointmentTime, String reason) {
        String title = "Update on Your Appointment Request";
        String body = String.format("""
            <p>Dear %s,</p>
            <p>We are writing to inform you about an update regarding your appointment request with Dr. %s for %s.</p>
            <p>Unfortunately, the doctor was unable to confirm your appointment at this time.</p>
            <div class="info-box">
                <p><strong>Reason provided:</strong> %s</p>
            </div>
            <p>We apologize for any inconvenience this may cause. Please feel free to browse for other available time slots.</p>
            <a href="%s/find-doctor" class="cta-button">Book Another Appointment</a>
            """,
                patientName,
                doctorName,
                appointmentTime.format(HUMAN_READABLE_FORMAT),
                reason,
                appBaseUrl
        );

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(patientEmail, "Appointment Update - MedVault", htmlContent);
    }


    public void sendEmergencyRequestNotification(String doctorEmail, String doctorName,
                                                 String patientName, String urgencyLevel,
                                                 String symptoms, String contactNumber, Long emergencyId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(doctorEmail);
            message.setSubject("🚨 MedVault - EMERGENCY REQUEST - " + urgencyLevel + " Priority");
            message.setText(String.format(
                    "Dear Dr. %s,\n\n" +
                            "🚨 EMERGENCY APPOINTMENT REQUEST\n\n" +
                            "Patient: %s\n" +
                            "Urgency Level: %s\n" +
                            "Symptoms: %s\n" +
                            "Contact: %s\n" +
                            "Emergency ID: #%d\n\n" +
                            "Please log into your MedVault dashboard immediately to accept this emergency request.\n\n" +
                            "Time is critical - please respond ASAP.\n\n" +
                            "MedVault Emergency System",
                    doctorName, patientName, urgencyLevel, symptoms, contactNumber, emergencyId
            ));

            mailSender.send(message);
            logger.info("Emergency notification sent to doctor: {}", doctorEmail);
        } catch (Exception e) {
            logger.error("Failed to send emergency notification: {}", e.getMessage());
        }
    }

    public void sendEmergencyAcceptanceNotification(String patientEmail, String patientName,
                                                    String doctorName, String doctorContact, String proposedTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(patientEmail);
            message.setSubject("✅ MedVault - Emergency Request Accepted");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "✅ Your emergency request has been accepted!\n\n" +
                            "Doctor: %s\n" +
                            "Doctor Contact: %s\n" +
                            "Proposed Time: %s\n\n" +
                            "The doctor will contact you shortly to confirm the emergency appointment details.\n\n" +
                            "Please keep your phone available.\n\n" +
                            "Best regards,\n" +
                            "MedVault Emergency Team",
                    patientName, doctorName, doctorContact,
                    proposedTime != null ? proposedTime : "To be confirmed via call"
            ));

            mailSender.send(message);
            logger.info("Emergency acceptance notification sent to patient: {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send emergency acceptance notification: {}", e.getMessage());
        }
    }

    // Add these methods to your EmailService.java class

    public void sendRecordAccessGrantedNotification(String doctorEmail, String doctorName,
                                                    String patientName, String recordTitle, String permissionType) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(doctorEmail);
            message.setSubject("📋 MedVault - Medical Record Access Granted");
            message.setText(String.format(
                    "Dear Dr. %s,\n\n" +
                            "Patient %s has granted you access to their medical record:\n\n" +
                            "Record: %s\n" +
                            "Permission Level: %s\n\n" +
                            "You can now view this record in your MedVault dashboard under 'Patient Records'.\n\n" +
                            "Best regards,\n" +
                            "MedVault Team",
                    doctorName, patientName, recordTitle, permissionType
            ));

            mailSender.send(message);
            logger.info("Record access notification sent to doctor: {}", doctorEmail);
        } catch (Exception e) {
            logger.error("Failed to send record access notification: {}", e.getMessage());
        }
    }

    public void sendRecordAccessRevokedNotification(String doctorEmail, String doctorName,
                                                    String patientName, String recordTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(doctorEmail);
            message.setSubject("🔒 MedVault - Medical Record Access Revoked");
            message.setText(String.format(
                    "Dear Dr. %s,\n\n" +
                            "Patient %s has revoked your access to their medical record:\n\n" +
                            "Record: %s\n\n" +
                            "You will no longer be able to view this record in your dashboard.\n\n" +
                            "Best regards,\n" +
                            "MedVault Team",
                    doctorName, patientName, recordTitle
            ));

            mailSender.send(message);
            logger.info("Record access revoked notification sent to doctor: {}", doctorEmail);
        } catch (Exception e) {
            logger.error("Failed to send record access revoked notification: {}", e.getMessage());
        }
    }

    public void sendAppointmentRescheduleNotification(String email, String firstName, String s, String s1, String rescheduleReason) {
    }

    // ✅ NEW: Enhanced granular sharing notification
    public void sendGranularAccessGrantedNotification(String doctorEmail, String doctorName,
                                                      String patientName, String recordTitle,
                                                      List<String> sharedFields, Integer durationHours) {
        String title = "Granular Medical Record Access Granted";
        String fieldsText = sharedFields != null && !sharedFields.isEmpty() ?
                String.join(", ", sharedFields) : "Full Record";

        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>Patient <strong>%s</strong> has granted you granular access to their medical record:</p>
            
            <div class="info-box">
                <p><strong>Record:</strong> %s</p>
                <p><strong>Shared Fields:</strong> %s</p>
                <p><strong>Access Duration:</strong> %d hours</p>
                <p><strong>Expires:</strong> %s</p>
            </div>
            
            <p>⏰ <strong>Time-Limited Access:</strong> This access will automatically expire after %d hours for privacy protection.</p>
            
            <a href="%s/doctor/patient-records" class="cta-button">View Shared Records</a>
            
            <p>Best regards,<br>The MedVault Team</p>
            """,
                doctorName, patientName, recordTitle, fieldsText, durationHours,
                LocalDateTime.now().plusHours(durationHours).format(HUMAN_READABLE_FORMAT),
                durationHours, appBaseUrl);

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "🔐 Granular Medical Record Access - MedVault", htmlContent);
    }

    // ✅ NEW: Access expiry warning
    public void sendAccessExpiryWarning(String doctorEmail, String doctorName,
                                        String patientName, String recordTitle, long hoursRemaining) {
        String title = "⚠️ Medical Record Access Expiring Soon";
        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>This is a reminder that your access to a patient's medical record will expire soon:</p>
            
            <div class="info-box">
                <p><strong>Patient:</strong> %s</p>
                <p><strong>Record:</strong> %s</p>
                <p><strong>Time Remaining:</strong> %d hours</p>
            </div>
            
            <p>⏰ <strong>Action Required:</strong> If you need continued access, please contact the patient to request an extension.</p>
            
            <a href="%s/doctor/patient-records" class="cta-button">Access Record Now</a>
            
            <p>Best regards,<br>The MedVault Team</p>
            """, doctorName, patientName, recordTitle, hoursRemaining, appBaseUrl);

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "⚠️ Medical Record Access Expiring - MedVault", htmlContent);
    }

    // ✅ NEW: Immediate revoke notification
    public void sendImmediateRevokeNotification(String doctorEmail, String doctorName,
                                                String patientName, String recordTitle) {
        String title = "🚫 Medical Record Access Revoked";
        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>Patient <strong>%s</strong> has immediately revoked your access to their medical record:</p>
            
            <div class="info-box">
                <p><strong>Record:</strong> %s</p>
                <p><strong>Status:</strong> Access Terminated</p>
                <p><strong>Revoked At:</strong> %s</p>
            </div>
            
            <p>🔒 <strong>Access Terminated:</strong> You can no longer view or download this record. The revocation is effective immediately.</p>
            
            <p>If you have questions about this decision, please contact the patient directly.</p>
            
            <p>Best regards,<br>The MedVault Team</p>
            """, doctorName, patientName, recordTitle, LocalDateTime.now().format(HUMAN_READABLE_FORMAT));

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "🚫 Medical Record Access Revoked - MedVault", htmlContent);
    }

    // ✅ NEW: Record deleted notification
    public void sendRecordDeletedNotification(String doctorEmail, String doctorName,
                                              String patientName, String recordTitle) {
        String title = "📄 Medical Record Deleted";
        String body = String.format("""
            <p>Dear Dr. %s,</p>
            <p>Patient <strong>%s</strong> has deleted a medical record that was previously shared with you:</p>
            
            <div class="info-box">
                <p><strong>Deleted Record:</strong> %s</p>
                <p><strong>Deleted At:</strong> %s</p>
            </div>
            
            <p>🗑️ <strong>Record Removed:</strong> This record is no longer available and has been permanently deleted from the system.</p>
            
            <p>Best regards,<br>The MedVault Team</p>
            """, doctorName, patientName, recordTitle, LocalDateTime.now().format(HUMAN_READABLE_FORMAT));

        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "📄 Medical Record Deleted - MedVault", htmlContent);
    }

    // ✅ ENHANCED: Updated appointment approval email with rescheduling info
    public void sendAppointmentConfirmationToPatient(String patientEmail, String patientName,
                                                     String doctorName, LocalDateTime appointmentTime) {
        String title = "Your Appointment is Confirmed!";
        String body = String.format("""
        <p>Dear %s,</p>
        <p>Great news! Your appointment has been confirmed. Please see the details below:</p>
        <div class="info-box">
            <p><strong>Doctor:</strong> Dr. %s</p>
            <p><strong>Date & Time:</strong> %s</p>
        </div>
        
        <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
            <h4 style="color: #92400e; margin-bottom: 10px;">📋 Important Information:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Please arrive 10 minutes early for your appointment</li>
                <li>Bring a valid ID and any relevant medical records</li>
                <li><strong>Rescheduling Policy:</strong> You can reschedule this appointment up to 24 hours before the scheduled time</li>
                <li>After approval, rescheduling will require doctor confirmation again</li>
            </ul>
        </div>
        
        <p><strong>⏰ Rescheduling Notice:</strong> If you need to reschedule, please do so at least 24 hours in advance through your patient portal. Last-minute changes may not be possible.</p>
        
        <a href="%s/patient/appointments" class="cta-button">Manage My Appointments</a>
        
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Dr. %s & The MedVault Team</p>
        """,
                patientName,
                doctorName,
                appointmentTime.format(HUMAN_READABLE_FORMAT),
                appBaseUrl,
                doctorName);
        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(patientEmail, "Your Appointment is Confirmed! - MedVault", htmlContent);
    }

    // ✅ NEW: Enhanced reschedule notification for doctors
    public void sendAppointmentRescheduleNotification(String doctorEmail, String doctorName,
                                                      String patientName, LocalDateTime oldTime,
                                                      LocalDateTime newTime, String reason) {
        String title = "Patient Rescheduled Appointment";
        String body = String.format("""
        <p>Dear Dr. %s,</p>
        <p>Patient <strong>%s</strong> has requested to reschedule their appointment:</p>
        
        <div class="info-box">
            <p><strong>Original Time:</strong> %s</p>
            <p><strong>Requested New Time:</strong> %s</p>
            <p><strong>Reason:</strong> %s</p>
        </div>
        
        <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
            <h4 style="color: #92400e; margin-bottom: 10px;">🔔 Action Required:</h4>
            <p style="color: #92400e; margin: 0;">Please review and approve/decline this rescheduling request in your dashboard.</p>
        </div>
        
        <p><strong>⏰ Time-Sensitive:</strong> The patient is waiting for your confirmation of the new appointment time.</p>
        
        <a href="%s/doctor/appointments" class="cta-button">Review Appointment Request</a>
        
        <p>Best regards,<br>The MedVault Team</p>
        """,
                doctorName, patientName,
                oldTime.format(HUMAN_READABLE_FORMAT),
                newTime.format(HUMAN_READABLE_FORMAT),
                reason,
                appBaseUrl);
        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(doctorEmail, "Appointment Rescheduling Request - MedVault", htmlContent);
    }

    // ✅ NEW: Patient notification for reschedule confirmation
    public void sendRescheduleConfirmationToPatient(String patientEmail, String patientName,
                                                    String doctorName, LocalDateTime oldTime,
                                                    LocalDateTime newTime, boolean requiresApproval) {
        String title = "Appointment Rescheduled Successfully";
        String statusMessage = requiresApproval
                ? "Your rescheduling request has been sent to the doctor for approval."
                : "Your appointment has been successfully rescheduled.";

        String body = String.format("""
        <p>Dear %s,</p>
        <p>%s</p>
        
        <div class="info-box">
            <p><strong>Doctor:</strong> Dr. %s</p>
            <p><strong>Previous Time:</strong> %s</p>
            <p><strong>New Time:</strong> %s</p>
        </div>
        
        %s
        
        <a href="%s/patient/appointments" class="cta-button">View My Appointments</a>
        
        <p>Thank you for using MedVault!</p>
        <p>Best regards,<br>The MedVault Team</p>
        """,
                patientName, statusMessage, doctorName,
                oldTime.format(HUMAN_READABLE_FORMAT),
                newTime.format(HUMAN_READABLE_FORMAT),
                requiresApproval
                        ? "<p><strong>⏳ Awaiting Approval:</strong> You will receive another email once the doctor confirms your new appointment time.</p>"
                        : "<p><strong>✅ Confirmed:</strong> Your new appointment time is confirmed. Please arrive 10 minutes early.</p>",
                appBaseUrl);
        String htmlContent = createHtmlEmailTemplate(title, body);
        sendHtmlEmail(patientEmail, "Appointment Rescheduled - MedVault", htmlContent);
    }



}
