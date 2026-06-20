package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "goals")
public class Goal {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Lob @Column(nullable = false) public String goal;
  @Lob @Column(nullable = false) public String biggestConfusion;
  @Lob @Column(nullable = false) public String successDefinition;
  @Column(nullable = false) public Integer weeklyAvailableHours;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
