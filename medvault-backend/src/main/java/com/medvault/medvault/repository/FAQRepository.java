package com.medvault.medvault.repository;

import com.medvault.medvault.model.FAQItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FAQRepository extends JpaRepository<FAQItem, Long> {
    List<FAQItem> findByIsActiveTrueOrderByPriorityDesc();
    List<FAQItem> findByCategoryAndIsActiveTrue(String category);

    @Query("SELECT f FROM FAQItem f WHERE f.isActive = true AND " +
            "(LOWER(f.question) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
            "LOWER(f.keywords) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
            "LOWER(f.answer) LIKE LOWER(CONCAT('%', ?1, '%'))) " +
            "ORDER BY f.priority DESC")
    List<FAQItem> searchFAQs(String keyword);
}
