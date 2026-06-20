package com.futureos.api.repository;

import com.futureos.api.model.Goal;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserOrderByCreatedAtDesc(User user);


    void deleteByUser(User user);
}