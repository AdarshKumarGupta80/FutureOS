package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "life_experiments")
public class LifeExperiment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Column(nullable = false) public String title;
  @Lob public String hypothesis;
  public Integer durationDays = 7;
  @Lob public String successMetric;
  @Column(nullable = false) public String status = "PLANNED";
}
