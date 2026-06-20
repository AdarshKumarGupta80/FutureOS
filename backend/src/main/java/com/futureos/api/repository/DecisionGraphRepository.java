package com.futureos.api.repository;

import com.futureos.api.model.DecisionGraph;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionGraphRepository extends JpaRepository<DecisionGraph, Long> {
  List<DecisionGraph> findByUserOrderByCreatedAtDesc(User user);
}
