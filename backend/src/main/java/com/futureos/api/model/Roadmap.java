package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "roadmaps")
public class Roadmap {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Column(nullable = false) public String title;
  @Lob public String weeklyPlan;
  @Lob public String monthlyPlan;
  @Lob public String expectedOutcomes;
  @Lob public String decisionTree;
  public Integer version = 1;
  @Lob public String adaptationReason;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
