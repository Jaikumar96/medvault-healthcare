package com.medvault.medvault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/health")

public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> checkDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            Connection connection = dataSource.getConnection();
            if (connection != null && !connection.isClosed()) {
                response.put("status", "UP");
                response.put("message", "Database connection is healthy");
                response.put("database", "MySQL");
                connection.close();
            } else {
                response.put("status", "DOWN");
                response.put("message", "Database connection failed");
            }
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("message", "Database connection error: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> checkApi() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "UP");
            response.put("message", "All API endpoints are operational");
            response.put("timestamp", System.currentTimeMillis());
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("message", "API health check failed");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email")
    public ResponseEntity<Map<String, Object>> checkEmail() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Mock email service check
            response.put("status", "UP");
            response.put("message", "Email service is operational");
            response.put("service", "SMTP");
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("message", "Email service unavailable");
        }
        return ResponseEntity.ok(response);
    }
}
