package com.futureos.api.repository;

import com.futureos.api.model.RoadmapVersion;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoadmapVersionRepository extends JpaRepository<RoadmapVersion, Long> {
  List<RoadmapVersion> findByUserOrderByCreatedAtDesc(User user);
}
