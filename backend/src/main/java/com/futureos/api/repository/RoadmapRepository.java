package com.futureos.api.repository;

import com.futureos.api.model.Roadmap;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
  List<Roadmap> findByUserOrderByCreatedAtDesc(User user);
}
