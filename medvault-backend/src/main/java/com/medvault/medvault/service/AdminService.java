package com.medvault.medvault.service;

import com.medvault.medvault.repository.UserRepository;
import com.medvault.medvault.repository.DoctorRepository;
import com.medvault.medvault.repository.PatientRepository;
import com.medvault.medvault.repository.AccessRequestRepository;
import com.medvault.medvault.model.Role;
import com.medvault.medvault.model.RequestStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalAdmins", userRepository.countByRole(Role.ADMIN));
        stats.put("pendingRequests", accessRequestRepository.countByStatus(RequestStatus.PENDING));

        // This month statistics
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        stats.put("newUsersThisMonth", userRepository.countByCreatedAtAfter(
                Timestamp.valueOf(startOfMonth).toLocalDateTime()
        ));

        return stats;
    }

    public Map<String, Object> getSystemAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Growth trends - now this method exists
        List<Object[]> monthlyStats = userRepository.getMonthlyRegistrationStats();
        analytics.put("monthlyRegistrations", monthlyStats);

        // Role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        roleDistribution.put("ADMIN", userRepository.countByRole(Role.ADMIN));
        roleDistribution.put("DOCTOR", userRepository.countByRole(Role.DOCTOR));
        roleDistribution.put("PATIENT", userRepository.countByRole(Role.PATIENT));
        analytics.put("roleDistribution", roleDistribution);

        return analytics;
    }

    public Map<String, Object> getRecentActivities() {
        Map<String, Object> activities = new HashMap<>();

        // Recent users (last 7 days) - now this method exists
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> recentUsers = userRepository.findRecentUsers(
                Timestamp.valueOf(weekAgo).toLocalDateTime()
        );
        activities.put("recentUsers", recentUsers);

        // Recent requests - now this method exists
        List<Object[]> recentRequests = accessRequestRepository.findRecentRequests(5);
        activities.put("recentRequests", recentRequests);

        return activities;
    }
}
