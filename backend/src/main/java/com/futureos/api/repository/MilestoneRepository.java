package com.futureos.api.repository;

import com.futureos.api.model.Milestone;
import com.futureos.api.model.Roadmap;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
  List<Milestone> findByRoadmap(Roadmap roadmap);
  List<Milestone> findByRoadmap_User(User user);
}
