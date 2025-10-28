// repository/AccessRequestRepository.java
package com.medvault.medvault.repository;
import com.medvault.medvault.service.EmailService;

import com.medvault.medvault.model.AccessRequest;
import com.medvault.medvault.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
    Optional<AccessRequest> findByEmail(String email);

    List<AccessRequest> findByStatus(RequestStatus status);

    List<AccessRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByEmail(String email);


    List<AccessRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    long countByStatus(RequestStatus status);

    @Query(value = "SELECT ar.id, ar.first_name, ar.last_name, ar.email, ar.requested_role, ar.created_at, ar.status " +
            "FROM access_requests ar " +
            "ORDER BY ar.created_at DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findRecentRequests(@Param("limit") int limit);
}