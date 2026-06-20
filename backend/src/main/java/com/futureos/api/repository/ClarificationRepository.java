package com.futureos.api.repository;

import com.futureos.api.model.Clarification;
import com.futureos.api.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClarificationRepository extends JpaRepository<Clarification, Long> {
    List<Clarification> findByUserOrderByCreatedAtDesc(User user);

    // Ownership-safe lookup — avoids touching the LAZY user proxy
    @Query("SELECT c FROM Clarification c WHERE c.id = :id AND c.user.id = :userId")
    Optional<Clarification> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}