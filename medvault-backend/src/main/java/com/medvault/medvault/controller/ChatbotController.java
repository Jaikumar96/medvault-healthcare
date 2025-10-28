package com.medvault.medvault.controller;

import com.medvault.medvault.model.ChatMessage;
import com.medvault.medvault.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")

public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            String message = (String) request.get("message");
            Long patientId = Long.valueOf(request.get("patientId").toString());
            String sessionId = (String) request.get("sessionId");

            String response = chatbotService.processMessage(message, patientId, sessionId);

            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("response",
                    "I'm having trouble processing your request. Please try again or contact support."));
        }
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String sessionId) {
        List<ChatMessage> history = chatbotService.getChatHistory(sessionId);
        return ResponseEntity.ok(history);
    }
}
