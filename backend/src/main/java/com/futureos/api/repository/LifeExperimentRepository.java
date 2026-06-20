package com.futureos.api.repository;

import com.futureos.api.model.LifeExperiment;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LifeExperimentRepository extends JpaRepository<LifeExperiment, Long> {
    List<LifeExperiment> findByUser(User user);

    @Query("select case when count(e) > 0 then true else false end from LifeExperiment e where e.id = :experimentId and e.user.id = :userId")
    boolean existsByIdAndUserId(@Param("experimentId") Long experimentId, @Param("userId") Long userId);
}