package com.medvault.medvault.service;

import com.medvault.medvault.model.*;
import com.medvault.medvault.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Autowired
    private FAQRepository faqRepository;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DoctorRepository doctorRepository;

    @Value("${openrouter.api.key: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}")
    private String openRouterApiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String openRouterApiUrl;

    // FIXED: Updated to use correct model ID
    @Value("${openrouter.model:google/gemma-2-9b-it:free}")
    private String model;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ChatbotService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String processMessage(String message, Long patientId, String sessionId) {
        System.out.println("=== PROCESSING MESSAGE ===");
        System.out.println("Input: " + message);
        System.out.println("Patient ID: " + patientId);

        // Save user message
        saveMessage(sessionId, patientId, message, null, true);

        String response = generateEnhancedResponse(message.toLowerCase().trim(), patientId);

        System.out.println("Final Response: " + response.substring(0, Math.min(100, response.length())) + "...");
        System.out.println("=== END PROCESSING ===");

        // Save bot response
        saveMessage(sessionId, patientId, message, response, false);
        return response;
    }

    private String generateEnhancedResponse(String message, Long patientId) {
        Optional<Patient> patientOpt = patientRepository.findByUserId(patientId);
        String patientName = patientOpt.map(Patient::getFirstName).orElse("there");

        // Check platform-specific first (appointments, doctors, etc.)
        if (isPlatformSpecificQuery(message)) {
            return generateHealthcareResponse(message, patientId, patientName);
        }

        // Route health questions to AI
        if (isHealthQuestionForAI(message)) {
            return generateLLMResponse(message, patientName, patientId);
        }

        // Everything else goes to AI too
        return generateLLMResponse(message, patientName, patientId);
    }

    private boolean isPlatformSpecificQuery(String message) {
        String[] platformKeywords = {
                // Greetings - should be handled by platform
                "hi", "hello", "hey", "good morning", "good afternoon", "good evening", "start", "begin",

                // Appointment management - ENHANCED
                "book appointment", "booking appointment", "schedule appointment",
                "book an appointment", "make appointment", "want appointment", "need appointment",
                "cancel appointment", "cancel my", "reschedule", "upcoming appointment",
                "my appointments", "view appointments", "manage appointments",

                // Doctor searches
                "show doctors", "list doctors", "available doctors", "show me doctors",
                "find doctor", "find a doctor", "doctors near me", "see doctors",
                "cardiologist", "neurologist", "dermatologist", "orthopedic",
                "pediatrician", "psychiatrist", "psychologist", "gynecologist",

                // Medical records
                "medical records", "my records", "health records", "medical history",
                "prescription history", "lab results", "test results",

                // Emergency
                "emergency", "urgent", "emergency assistance",

                // Platform navigation
                "access", "how do i", "where can i", "how to",
                "update profile", "payment methods", "insurance",

                // Mental health platform services
                "see psychiatrist", "need psychiatrist", "book psychiatrist",
                "mental health support"
        };

        return Arrays.stream(platformKeywords)
                .anyMatch(keyword -> message.toLowerCase().contains(keyword.toLowerCase()));
    }

    private String generateHealthcareResponse(String message, Long patientId, String patientName) {
        // Handle greetings first
        if (isGreeting(message)) {
            return getPersonalizedGreeting(patientName);
        }

        // Handle platform-specific queries
        if (isShowDoctorsQuery(message)) {
            return getDetailedDoctorsList(patientName);
        }

        if (isSpecificSpecialtyQuery(message)) {
            return getSpecialtyDoctors(message, patientName);
        }

        // ENHANCED: Better appointment booking detection
        if (isAppointmentBookingQuery(message)) {
            return getEnhancedBookingFlow(message, patientId, patientName);
        }

        if (isAppointmentManagementQuery(message)) {
            return getAppointmentManagement(message, patientId, patientName);
        }

        if (isMedicalRecordsQuery(message)) {
            return getMedicalRecordsInfo(patientName);
        }

        if (isEmergencyQuery(message)) {
            return getEmergencyResponse(patientName);
        }

        if (isMentalHealthQuery(message)) {
            return getMentalHealthSupport(message, patientName);
        }

        if (isDoctorReviewQuery(message)) {
            return getDoctorReviewInstructions(patientId, patientName);
        }

        // For health questions and other queries, use AI
        return generateLLMResponse(message, patientName, patientId);
    }

    // ENHANCED DETECTION METHODS
    private boolean isGreeting(String message) {
        String[] greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening", "start", "begin"};
        return Arrays.stream(greetings).anyMatch(greeting ->
                message.equals(greeting) || message.startsWith(greeting + " ") || message.startsWith(greeting + "!"));
    }

    private boolean isShowDoctorsQuery(String message) {
        return message.contains("show doctors") || message.contains("list doctors") ||
                message.contains("available doctors") || message.contains("show me doctors") ||
                message.contains("find doctor") || message.contains("find a doctor") ||
                message.contains("see doctors") || message.equals("doctors");
    }

    private boolean isSpecificSpecialtyQuery(String message) {
        String[] specialties = {
                "cardiologist", "neurologist", "dermatologist", "orthopedic",
                "pediatrician", "psychiatrist", "psychologist", "gynecologist",
                "cardiology", "neurology", "dermatology", "orthopedics",
                "pediatrics", "psychiatry", "psychology", "gynecology",
                "endocrinologist", "urologist", "oncologist", "radiologist"
        };
        return Arrays.stream(specialties).anyMatch(message::contains);
    }

    // NEW: Enhanced appointment booking detection
    private boolean isAppointmentBookingQuery(String message) {
        String[] bookingKeywords = {
                "book appointment", "book an appointment", "booking appointment",
                "schedule appointment", "make appointment", "want appointment",
                "need appointment", "see doctor", "visit doctor", "consultation",
                "appointment with", "book with"
        };

        return Arrays.stream(bookingKeywords)
                .anyMatch(keyword -> message.toLowerCase().contains(keyword.toLowerCase()));
    }

    private boolean isDoctorReviewQuery(String message) {
        return message.contains("review") || message.contains("rate") || message.contains("rating") ||
                message.contains("stars") || message.contains("feedback") || message.contains("opinion");
    }

    private boolean isMentalHealthQuery(String message) {
        return message.contains("mental health") || message.contains("psychiatrist") ||
                message.contains("psychologist") || message.contains("therapy") ||
                message.contains("counseling") || message.contains("anxiety") ||
                message.contains("depression") || message.contains("stress") ||
                message.contains("anxious") || message.contains("sad") ||
                message.contains("worried") || message.contains("panic") ||
                message.contains("see psychiatrist") || message.contains("need psychiatrist");
    }

    private boolean isBookingQuery(String message) {
        return message.contains("book") || message.contains("booking") ||
                message.contains("schedule") || message.contains("appointment");
    }

    private boolean isAppointmentManagementQuery(String message) {
        return message.contains("my appointments") || message.contains("reschedule") ||
                message.contains("cancel appointment") || message.contains("upcoming appointment") ||
                message.contains("cancel my") || message.contains("cancel upcoming") ||
                message.contains("view appointments") || message.contains("manage appointments");
    }

    private boolean isEmergencyQuery(String message) {
        return message.contains("emergency") || message.contains("urgent") ||
                message.contains("help me") || message.contains("emergency assistance");
    }

    private boolean isMedicalRecordsQuery(String message) {
        return message.contains("medical records") || message.contains("my records") ||
                message.contains("health records") || message.contains("medical history") ||
                message.contains("access") && (message.contains("records") || message.contains("history"));
    }

    private boolean isHealthQuestionForAI(String message) {
        String[] healthKeywords = {
                "what causes", "what is", "what are", "symptoms", "causes",
                "blood pressure", "diabetes", "anxiety", "headache", "fever",
                "how do", "why do", "treatment", "medication", "side effects",
                "pain", "hurt", "ache", "feel sick", "not well"
        };

        String lowerMessage = message.toLowerCase();
        return Arrays.stream(healthKeywords).anyMatch(lowerMessage::contains);
    }

    // NEW: Enhanced booking flow with profile validation
    private String getEnhancedBookingFlow(String message, Long patientId, String patientName) {
        // Check if patient profile is complete
        Optional<Patient> patientOpt = patientRepository.findByUserId(patientId);

        if (patientOpt.isEmpty()) {
            return String.format("Hi %s! I'd love to help you book an appointment, but I need you to " +
                    "complete your patient profile first. 📋\n\n" +
                    "Please go to 'My Profile' and fill in:\n" +
                    "• Personal information\n• Contact details\n• Medical history\n• Insurance information\n\n" +
                    "Once your profile is complete, I can help you book appointments with our specialists!", patientName);
        }

        Patient patient = patientOpt.get();

        // Check profile completeness
        if (!isProfileComplete(patient)) {
            return String.format("Hi %s! I see your profile needs some updates before booking. 📝\n\n" +
                            "Please complete these sections in 'My Profile':\n" +
                            "%s\n\n" +
                            "A complete profile helps doctors provide better care! Once updated, I'll be happy to help you book an appointment.",
                    patientName, getMissingProfileFields(patient));
        }

        // Profile is complete - provide comprehensive booking options
        return getComprehensiveBookingGuide(patientName);
    }

    // NEW: Comprehensive booking guide
    private String getComprehensiveBookingGuide(String patientName) {
        try {
            List<Doctor> availableDoctors = doctorRepository.findByStatus(DoctorStatus.APPROVED);

            if (availableDoctors.isEmpty()) {
                return String.format("Hi %s! I'd love to help you book an appointment, but our doctors are currently " +
                        "updating their schedules. Please try again in a few minutes or contact support at 1800-MEDVAULT.", patientName);
            }

            Map<String, List<Doctor>> doctorsBySpecialty = availableDoctors.stream()
                    .collect(Collectors.groupingBy(Doctor::getSpecialization));

            StringBuilder response = new StringBuilder(String.format(
                    "Perfect! I'm ready to help you book an appointment, %s! 🏥\n\n" +
                            "**Available Booking Options:**\n\n", patientName));

            // Show top specialties with available doctors
            doctorsBySpecialty.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                    .limit(6)
                    .forEach(entry -> {
                        String emoji = getSpecializationEmoji(entry.getKey());
                        response.append(String.format("%s **%s** (%d doctors available)\n",
                                emoji, entry.getKey(), entry.getValue().size()));
                    });

            response.append("\n**How to Book:**\n")
                    .append("🔹 Go to 'Book Appointment' in your dashboard\n")
                    .append("🔹 Choose your preferred specialty or doctor\n")
                    .append("🔹 Select an available time slot\n")
                    .append("🔹 Add reason for visit (optional but helpful)\n")
                    .append("🔹 Confirm your booking\n\n")
                    .append("**Quick Questions to Try:**\n")
                    .append("• \"Show me cardiologists\" - See heart specialists\n")
                    .append("• \"I need urgent care\" - Emergency booking\n")
                    .append("• \"Available today\" - Today's appointments\n\n")
                    .append("What type of doctor would you like to see?");

            return response.toString();

        } catch (Exception e) {
            return String.format("I'm excited to help you book an appointment, %s! 📅\n\n" +
                    "Here's what you can do:\n\n" +
                    "**Step 1:** Visit the 'Book Appointment' section\n" +
                    "**Step 2:** Browse our specialists or search by specialty\n" +
                    "**Step 3:** Choose a convenient time slot\n" +
                    "**Step 4:** Confirm your booking\n\n" +
                    "You'll receive confirmation via email and SMS. " +
                    "What type of specialist are you looking for?", patientName);
        }
    }

    // NEW: Profile validation methods
    private boolean isProfileComplete(Patient patient) {
        return patient.getFirstName() != null && !patient.getFirstName().isEmpty() &&
                patient.getLastName() != null && !patient.getLastName().isEmpty() &&
                patient.getDateOfBirth() != null &&
                patient.getGender() != null &&
                patient.getContactNumber() != null && !patient.getContactNumber().isEmpty();
    }

    private String getMissingProfileFields(Patient patient) {
        List<String> missing = new ArrayList<>();

        if (patient.getFirstName() == null || patient.getFirstName().isEmpty()) {
            missing.add("• First Name");
        }
        if (patient.getLastName() == null || patient.getLastName().isEmpty()) {
            missing.add("• Last Name");
        }
        if (patient.getDateOfBirth() == null) {
            missing.add("• Date of Birth");
        }
        if (patient.getGender() == null) {
            missing.add("• Gender");
        }
        if (patient.getContactNumber() == null || patient.getContactNumber().isEmpty()) {
            missing.add("• Contact Number");
        }

        return String.join("\n", missing);
    }

    // ENHANCED LLM INTEGRATION
    private String generateLLMResponse(String message, String patientName, Long patientId) {
        try {
            // Create the request payload
            String requestBody = createOpenRouterRequest(message, patientName);

            // Build HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(openRouterApiUrl))
                    .header("Authorization", "Bearer " + openRouterApiKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "https://medvault.com")
                    .header("X-Title", "MedVault Healthcare Assistant")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            // Send request
            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return parseOpenRouterResponse(response.body(), patientName);
            } else {
                System.err.println("OpenRouter API Error: " + response.statusCode() + " - " + response.body());
                return getContextualDefaultResponse(message, patientName);
            }

        } catch (Exception e) {
            System.err.println("LLM API Error: " + e.getMessage());
            e.printStackTrace();
            // Fallback to contextual response
            return getContextualDefaultResponse(message, patientName);
        }
    }

    private String createOpenRouterRequest(String message, String patientName) throws Exception {
        String systemPrompt = String.format("""
            You are Dr. MedVault, a helpful and empathetic healthcare assistant for the MedVault platform.
            
            CONTEXT: You're helping %s with their healthcare needs.
            
            YOUR ROLE:
            - Provide accurate, helpful health information and education
            - Be empathetic and supportive, especially for health concerns
            - Guide users to appropriate medical care when needed
            - Answer questions about symptoms, conditions, treatments, and wellness
            
            CAPABILITIES & PLATFORM FEATURES:
            - MedVault has specialists in all major medical fields
            - Patients can book appointments, view records, get emergency help
            - 24/7 mental health crisis support available
            - Comprehensive medical record management
            
            RESPONSE GUIDELINES:
            1. Always be warm, professional, and empathetic
            2. Provide educational health information while emphasizing professional consultation
            3. Use appropriate medical terminology but keep explanations accessible
            4. Include relevant emojis sparingly (🏥 👨‍⚕️ 🩺 💙 🧠)
            5. Keep responses informative but concise (200-400 words)
            6. Always recommend seeing healthcare professionals for diagnosis/treatment
            7. For mental health concerns, be extra supportive and caring
            8. Suggest relevant MedVault services when appropriate
            
            IMPORTANT: Never provide specific medical diagnoses or prescriptions. Always recommend consulting qualified healthcare professionals for proper evaluation and treatment.
            
            Answer the user's health question thoughtfully and provide actionable guidance while connecting them to appropriate care through MedVault.
            """, patientName);

        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("model", model);
        requestMap.put("max_tokens", 500);
        requestMap.put("temperature", 0.7);

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", message);
        messages.add(userMessage);

        requestMap.put("messages", messages);

        return objectMapper.writeValueAsString(requestMap);
    }

    private String parseOpenRouterResponse(String responseBody, String patientName) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);

        if (rootNode.has("choices") && rootNode.get("choices").isArray() &&
                rootNode.get("choices").size() > 0) {

            JsonNode firstChoice = rootNode.get("choices").get(0);
            if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                String content = firstChoice.get("message").get("content").asText().trim();

                // Ensure response addresses the patient by name if appropriate
                if (!content.toLowerCase().contains(patientName.toLowerCase()) &&
                        !patientName.equals("there") && !content.toLowerCase().startsWith("hi")) {
                    content = String.format("Hi %s! %s", patientName, content);
                }

                return content;
            }
        }

        // Fallback if parsing fails
        return String.format("I'm here to help you with your health questions, %s! Could you please rephrase what you'd like to know?", patientName);
    }

    // RESPONSE METHODS - All your existing well-crafted responses
    private String getPersonalizedGreeting(String patientName) {
        return String.format("Hello %s! 👋 I'm Dr. MedVault, your personal healthcare assistant. " +
                "I'm here to help you with all your medical needs.\n\n" +
                "I can help you with:\n" +
                "🏥 Book and manage appointments\n" +
                "👨‍⚕️ Find the right doctors and specialists\n" +
                "📋 Access your medical records\n" +
                "🆘 Emergency guidance\n" +
                "🧠 Mental health support\n" +
                "🩺 Answer your health questions\n\n" +
                "What would you like to do today?", patientName);
    }

    private String getDetailedDoctorsList(String patientName) {
        try {
            List<Doctor> doctors = doctorRepository.findByStatus(DoctorStatus.APPROVED);

            if (doctors.isEmpty()) {
                return String.format("I apologize, %s. We're currently updating our doctor profiles. " +
                        "Please try again in a few minutes or contact support at 1800-MEDVAULT.", patientName);
            }

            Map<String, List<Doctor>> doctorsBySpecialty = doctors.stream()
                    .collect(Collectors.groupingBy(Doctor::getSpecialization));

            StringBuilder response = new StringBuilder(String.format("Here are our available doctors, %s:\n\n", patientName));

            doctorsBySpecialty.forEach((specialty, docs) -> {
                String emoji = getSpecializationEmoji(specialty);
                response.append(String.format("%s **%s** (%d doctors)\n", emoji, specialty, docs.size()));

                docs.stream().limit(2).forEach(doctor -> {
                    response.append(String.format("   • Dr. %s %s - ₹%s consultation\n",
                            doctor.getFirstName(),
                            doctor.getLastName(),
                            doctor.getConsultationFees() != null ? doctor.getConsultationFees() : "Contact for pricing"));
                });
                response.append("\n");
            });

            response.append("To book an appointment, go to 'Book Appointment' section or tell me which specialty you need!");
            return response.toString();

        } catch (Exception e) {
            return String.format("I'd love to show you our doctors, %s! Please visit the 'Book Appointment' " +
                    "section to see all available specialists and their detailed profiles.", patientName);
        }
    }

    private String getSpecialtyDoctors(String message, String patientName) {
        try {
            List<Doctor> doctors = doctorRepository.findByStatus(DoctorStatus.APPROVED);
            String specialty = extractSpecialty(message);

            List<Doctor> specialtyDoctors = doctors.stream()
                    .filter(d -> d.getSpecialization().toLowerCase().contains(specialty.toLowerCase()))
                    .collect(Collectors.toList());

            if (specialtyDoctors.isEmpty()) {
                return String.format("Hi %s! We don't currently have %s specialists available. " +
                        "However, I can help you find a general physician who can provide a referral. " +
                        "Would you like me to show you our general medicine doctors?", patientName, specialty);
            }

            StringBuilder response = new StringBuilder(String.format("Great choice, %s! Here are our %s specialists:\n\n",
                    patientName, specialty));

            specialtyDoctors.stream().limit(3).forEach(doctor -> {
                response.append(String.format("👨‍⚕️ **Dr. %s %s**\n" +
                                "💰 Consultation: ₹%s\n" +
                                "📞 Contact: %s\n" +
                                "⭐ Experience: %s\n\n",
                        doctor.getFirstName(),
                        doctor.getLastName(),
                        doctor.getConsultationFees() != null ? doctor.getConsultationFees() : "Contact for pricing",
                        doctor.getContactNumber() != null ? doctor.getContactNumber() : "Available through booking",
                        doctor.getSpecialization()));
            });

            response.append("Would you like me to help you book an appointment with any of these specialists?");
            return response.toString();

        } catch (Exception e) {
            return String.format("I'd be happy to help you find the right specialist, %s! " +
                    "Please visit 'Book Appointment' to see all our doctors.", patientName);
        }
    }

    private String getMentalHealthSupport(String message, String patientName) {
        if (message.contains("see psychiatrist") || message.contains("need psychiatrist") ||
                message.contains("book psychiatrist")) {
            return String.format("I understand you're looking for psychiatric care, %s. 🧠\n\n" +
                    "Our psychiatrists can help with:\n" +
                    "💊 Medication management for depression, anxiety, bipolar disorder\n" +
                    "🧠 Mental health assessments and diagnosis\n" +
                    "📋 Treatment planning and follow-up care\n" +
                    "🔄 Medication adjustments and monitoring\n\n" +
                    "Available psychiatrists:\n" +
                    "👨‍⚕️ Dr. Sarah Johnson - Depression & Anxiety Specialist\n" +
                    "👨‍⚕️ Dr. Michael Chen - Bipolar & Mood Disorders\n\n" +
                    "Would you like me to help you book a consultation?", patientName);
        }

        if (message.contains("anxiety") || message.contains("anxious")) {
            return String.format("I understand you're feeling anxious, %s. You're not alone, and I'm here to help. 💙\n\n" +
                    "Immediate relief techniques:\n" +
                    "🧘 Deep breathing: 4 counts in, hold 4, exhale 6\n" +
                    "🚶‍♀️ Take a short walk or do gentle stretching\n" +
                    "📱 Try meditation apps like Headspace or Calm\n" +
                    "💬 Reach out to someone you trust\n\n" +
                    "Professional support available:\n" +
                    "📞 24/7 Mental Health Crisis Line: 1800-599-0019\n" +
                    "👨‍⚕️ Book with our anxiety specialists\n" +
                    "👥 Join our anxiety support groups\n\n" +
                    "Would you like me to schedule an appointment with a mental health professional?", patientName);
        }

        return String.format("Thank you for trusting me with your mental health concerns, %s. 💙\n\n" +
                "Our comprehensive mental health services:\n" +
                "🧠 Psychiatrists for medication and diagnosis\n" +
                "💬 Psychologists for therapy and counseling\n" +
                "🧘 Stress management programs\n" +
                "👥 Support groups for various conditions\n" +
                "📞 24/7 crisis support: 1800-599-0019\n\n" +
                "Your mental health is just as important as your physical health. " +
                "What type of support would be most helpful for you right now?", patientName);
    }

    private String getBookingInstructions(String patientName) {
        return String.format("I'd be delighted to help you book an appointment, %s! 📅\n\n" +
                "**Step-by-step booking process:**\n" +
                "1️⃣ Go to 'Book Appointment' section in your dashboard\n" +
                "2️⃣ Choose your preferred doctor or browse by specialty\n" +
                "3️⃣ Select an available time slot that works for you\n" +
                "4️⃣ Add any specific health concerns or notes\n" +
                "5️⃣ Confirm your booking\n\n" +
                "**What happens next:**\n" +
                "✅ Doctor reviews your request\n" +
                "✅ You'll get confirmation via email/SMS\n" +
                "✅ Appointment details added to 'My Appointments'\n\n" +
                "You can choose a doctor from any specialty. Which type of doctor are you looking for?", patientName);
    }

    private String getAppointmentManagement(String message, Long patientId, String patientName) {
        if (message.contains("cancel")) {
            return String.format("I understand you want to cancel an appointment, %s! Here's how to do it:\n\n" +
                    "📱 **To Cancel Your Appointment:**\n" +
                    "1️⃣ Go to 'My Appointments' section in your dashboard\n" +
                    "2️⃣ Find the appointment you want to cancel\n" +
                    "3️⃣ Click the 'Cancel' button next to the appointment\n" +
                    "4️⃣ Confirm the cancellation\n\n" +
                    "⚠️ **Important:** Please cancel at least 24 hours before your appointment " +
                    "to avoid cancellation fees.\n\n" +
                    "💡 **Alternative:** If you need to reschedule instead of cancel, " +
                    "use the 'Reschedule' option to pick a new time slot.\n\n" +
                    "Need help finding a specific appointment to cancel?", patientName);
        }

        if (message.contains("reschedule")) {
            return String.format("Of course, %s! Here's how to reschedule your appointment:\n\n" +
                    "📱 Go to 'My Appointments' section\n" +
                    "🔍 Find the appointment you want to change\n" +
                    "🔄 Click 'Reschedule' button\n" +
                    "📅 Choose a new available time slot\n" +
                    "✅ Confirm the changes\n\n" +
                    "**Important:** Please reschedule at least 24 hours before your appointment " +
                    "to avoid any cancellation fees. Need help finding a specific appointment?", patientName);
        }

        return String.format("I'm here to help manage your appointments, %s! 📋\n\n" +
                "I can help you:\n" +
                "📅 Check upcoming appointments\n" +
                "🔄 Reschedule existing bookings\n" +
                "❌ Cancel appointments if needed\n" +
                "📋 View appointment history\n" +
                "💬 Contact your doctors\n\n" +
                "What would you like to do with your appointments?", patientName);
    }

    private String getEmergencyResponse(String patientName) {
        return String.format("🚨 %s, I want to make sure you get the right help immediately!\n\n" +
                "**For Life-Threatening Emergencies:**\n" +
                "📞 Call 108 (Ambulance) RIGHT NOW\n" +
                "🏥 Go to the nearest emergency room\n\n" +
                "**For Urgent Medical Care:**\n" +
                "⚡ Use 'Emergency Request' in 'My Appointments'\n" +
                "📱 Call MedVault Emergency: 1800-MEDVAULT\n" +
                "💬 Continue chatting with me for guidance\n\n" +
                "⚠️ **Call 108 immediately if you have:**\n" +
                "• Chest pain or difficulty breathing\n" +
                "• Severe bleeding or injury\n" +
                "• Loss of consciousness\n" +
                "• Severe allergic reaction\n\n" +
                "Your safety is our top priority. What kind of emergency assistance do you need?", patientName);
    }

    private String getMedicalRecordsInfo(String patientName) {
        return String.format("Hi %s! Here's how to access your medical records:\n\n" +
                "📋 **Available in 'Medical Records' section:**\n" +
                "• Consultation notes from doctors\n" +
                "• Prescription history\n" +
                "• Lab test results\n" +
                "• Imaging reports (X-rays, MRI, etc.)\n" +
                "• Vaccination records\n" +
                "• Treatment summaries\n\n" +
                "📱 **What you can do:**\n" +
                "👀 View all records online\n" +
                "⬇️ Download PDF copies\n" +
                "📧 Share with other doctors\n" +
                "🔒 Everything is secure and encrypted\n\n" +
                "Would you like help accessing a specific type of medical record?", patientName);
    }

    private String getDoctorReviewInstructions(Long patientId, String patientName) {
        return String.format("Hi %s! Here's how to review and rate your doctors:\n\n" +
                "⭐ Go to 'My Appointments' section\n" +
                "⭐ Find your completed appointments\n" +
                "⭐ Click 'Leave Review' next to the appointment\n" +
                "⭐ Rate from 1-5 stars ⭐⭐⭐⭐⭐\n" +
                "⭐ Write your experience to help other patients\n\n" +
                "Your honest feedback helps us maintain quality care and helps other patients " +
                "choose the right doctors. Is there a specific doctor you'd like to review?", patientName);
    }

    // UTILITY METHODS
    private String extractSpecialty(String message) {
        if (message.contains("cardiologist") || message.contains("cardiology")) return "Cardiology";
        if (message.contains("neurologist") || message.contains("neurology")) return "Neurology";
        if (message.contains("dermatologist") || message.contains("dermatology")) return "Dermatology";
        if (message.contains("orthopedic") || message.contains("orthopedics")) return "Orthopedics";
        if (message.contains("pediatrician") || message.contains("pediatrics")) return "Pediatrics";
        if (message.contains("psychiatrist") || message.contains("psychiatry")) return "Psychiatry";
        if (message.contains("psychologist") || message.contains("psychology")) return "Psychology";
        if (message.contains("gynecologist") || message.contains("gynecology")) return "Gynecology";
        if (message.contains("endocrinologist")) return "Endocrinology";
        if (message.contains("urologist")) return "Urology";
        if (message.contains("oncologist")) return "Oncology";
        return "General Medicine";
    }

    private String getSpecializationEmoji(String specialization) {
        String spec = specialization.toLowerCase();
        if (spec.contains("cardio")) return "❤️";
        if (spec.contains("neuro")) return "🧠";
        if (spec.contains("ortho")) return "🦴";
        if (spec.contains("pediatric")) return "👶";
        if (spec.contains("derma")) return "🌟";
        if (spec.contains("mental") || spec.contains("psychiatr")) return "🧠";
        if (spec.contains("psychology")) return "💭";
        if (spec.contains("gynecol")) return "👩‍⚕️";
        return "👨‍⚕️";
    }

    private String getContextualDefaultResponse(String message, String patientName) {
        // More intelligent fallback based on what the user was trying to do
        if (message.contains("what") || message.contains("how") || message.contains("why")) {
            return String.format("I'd love to help answer your question, %s! While I'm having trouble " +
                    "with that specific query right now, I can help you with:\n\n" +
                    "🩺 General health questions and symptoms\n" +
                    "👨‍⚕️ Finding doctors and specialists\n" +
                    "📅 Booking and managing appointments\n" +
                    "📋 Accessing medical records\n\n" +
                    "Could you rephrase your question or ask about any of these topics?", patientName);
        }

        if (message.contains("cancel") || message.contains("appointment")) {
            return String.format("It looks like you're asking about appointments, %s! " +
                    "I can help you manage your appointments. Try asking:\n\n" +
                    "• \"Cancel my upcoming appointment\"\n" +
                    "• \"Show my appointments\"\n" +
                    "• \"How do I reschedule?\"\n" +
                    "• \"Book an appointment\"\n\n" +
                    "What would you like to do with your appointments?", patientName);
        }

        return String.format("I want to help you, %s! I didn't quite catch that, but here's what I can do:\n\n" +
                "🏥 **Health Services:**\n" +
                "• Book appointments with specialists\n" +
                "• Find doctors by specialty\n" +
                "• Access your medical records\n" +
                "• Get emergency assistance\n" +
                "• Mental health support\n" +
                "• Answer health questions\n\n" +
                "💬 **Try asking:**\n" +
                "• \"Show me cardiologists\"\n" +
                "• \"What are symptoms of diabetes?\"\n" +
                "• \"Book an appointment\"\n" +
                "• \"I'm feeling anxious\"\n\n" +
                "What specific help do you need today?", patientName);
    }

    private void saveMessage(String sessionId, Long patientId, String message, String response, boolean isUserMessage) {
        try {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSessionId(sessionId);
            chatMessage.setPatientId(patientId);
            chatMessage.setMessage(message);
            chatMessage.setResponse(response);
            chatMessage.setIsUserMessage(isUserMessage);
            chatMessage.setCreatedAt(LocalDateTime.now());
            chatMessageRepository.save(chatMessage);
        } catch (Exception e) {
            System.err.println("Error saving chat message: " + e.getMessage());
        }
    }

    public List<ChatMessage> getChatHistory(String sessionId) {
        try {
            return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        } catch (Exception e) {
            System.err.println("Error retrieving chat history: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Test method for API connection
    public void testAPIConnection() {
        try {
            String testResponse = generateLLMResponse("Hello", "TestUser", 1L);
            System.out.println("API Test Result: " + testResponse);
        } catch (Exception e) {
            System.err.println("API Test Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
