package com.medvault.medvault.repository;

import com.medvault.medvault.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    List<ChatMessage> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.patientId = ?1 ORDER BY cm.createdAt DESC")
    List<ChatMessage> findRecentChatsByPatient(Long patientId);
}
