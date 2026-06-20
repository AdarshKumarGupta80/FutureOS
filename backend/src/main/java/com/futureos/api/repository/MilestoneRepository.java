package com.futureos.api.repository;

import com.futureos.api.model.Milestone;
import com.futureos.api.model.Roadmap;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByRoadmap(Roadmap roadmap);
    List<Milestone> findByRoadmap_User(User user);

    @Query("SELECT m FROM Milestone m JOIN FETCH m.roadmap r JOIN FETCH r.user WHERE m.id = :id")
    java.util.Optional<Milestone> findByIdWithRoadmapAndUser(@Param("id") Long id);

    @Query("SELECT m FROM Milestone m WHERE m.roadmap.id = :roadmapId ORDER BY m.id ASC")
    List<Milestone> findByRoadmapIdOrderById(@Param("roadmapId") Long roadmapId);
}