// UserRepository.java
package com.medvault.medvault.repository;

import com.medvault.medvault.model.User;
import com.medvault.medvault.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    long countByRole(Role role);
    long countByCreatedAtAfter(LocalDateTime date);

    @Query(value = "SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at " +
            "FROM users u WHERE u.created_at >= :since ORDER BY u.created_at DESC",
            nativeQuery = true)
    List<Object[]> findRecentUsers(@Param("since") LocalDateTime since);

    @Query(value = "SELECT MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count " +
            "FROM users GROUP BY YEAR(created_at), MONTH(created_at) " +
            "ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC LIMIT 12",
            nativeQuery = true)
    List<Object[]> getMonthlyRegistrationStats();
}
