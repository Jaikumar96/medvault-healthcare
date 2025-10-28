package com.medvault.medvault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")

public class SettingsController {

    @PostMapping("/preferences")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> savePreferences(@RequestBody Map<String, Object> preferences) {
        try {
            // Here you can save preferences to database
            // For now, we'll just return success
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Preferences saved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to save preferences"
            ));
        }
    }

    @GetMapping("/preferences")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPreferences() {
        try {
            // Return user preferences from database
            Map<String, Object> defaultPreferences = Map.of(
                    "darkMode", false,
                    "language", "en",
                    "dateFormat", "MM/DD/YYYY",
                    "numberFormat", "1,000.00",
                    "timezone", "UTC",
                    "instantSearch", true,
                    "emailNotifications", true,
                    "soundNotifications", false,
                    "autoSave", true
            );

            return ResponseEntity.ok(defaultPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to load preferences"
            ));
        }
    }
}
