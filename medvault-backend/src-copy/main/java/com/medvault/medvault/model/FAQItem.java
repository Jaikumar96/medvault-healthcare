package com.medvault.medvault.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "faq_items")
public class FAQItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category")
    private String category;

    @Column(name = "question", columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
