package com.futureos.api.repository;

import com.futureos.api.model.GapReport;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GapReportRepository extends JpaRepository<GapReport, Long> {
  List<GapReport> findByUserOrderByCreatedAtDesc(User user);
}
