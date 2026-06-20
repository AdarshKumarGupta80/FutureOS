package com.futureos.api.repository;

import com.futureos.api.model.AccountabilityInsight;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountabilityInsightRepository extends JpaRepository<AccountabilityInsight, Long> {
  List<AccountabilityInsight> findByUserOrderByCreatedAtDesc(User user);
}
