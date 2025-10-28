// controller/AccessRequestController.java
package com.medvault.medvault.controller;

import com.medvault.medvault.model.AccessRequest;
import com.medvault.medvault.service.AccessRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/access-requests")

public class AccessRequestController {

    @Autowired
    private AccessRequestService accessRequestService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitRequest(@RequestBody AccessRequest request) {
        try {
            AccessRequest savedRequest = accessRequestService.submitRequest(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Request submitted successfully! You will receive an email confirmation.");
            response.put("requestId", savedRequest.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<AccessRequest>> getAllRequests() {
        List<AccessRequest> requests = accessRequestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AccessRequest>> getPendingRequests() {
        List<AccessRequest> requests = accessRequestService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestParam Long reviewerId) {
        try {
            AccessRequest updatedRequest = accessRequestService.approveRequest(id, reviewerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Request approved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestParam Long reviewerId) {
        try {
            AccessRequest updatedRequest = accessRequestService.rejectRequest(id, reviewerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Request rejected successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


}
