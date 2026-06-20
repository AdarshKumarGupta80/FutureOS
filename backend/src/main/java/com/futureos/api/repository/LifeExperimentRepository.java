package com.futureos.api.repository;

import com.futureos.api.model.LifeExperiment;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LifeExperimentRepository extends JpaRepository<LifeExperiment, Long> {
  List<LifeExperiment> findByUser(User user);
}
