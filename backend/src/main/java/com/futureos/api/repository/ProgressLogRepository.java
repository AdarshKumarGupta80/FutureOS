package com.futureos.api.repository;

import com.futureos.api.model.ProgressLog;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {
  List<ProgressLog> findByUserOrderByCreatedAtDesc(User user);
}
