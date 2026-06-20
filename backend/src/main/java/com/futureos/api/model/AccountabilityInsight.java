package com.futureos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "accountability_insights")
public class AccountabilityInsight {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  public Double completionRate = 0.0;
  public Integer missedCommitments = 0;
  public Double consistencyScore = 0.0;
  @Lob public String commonBlockers;
  @Lob public String weeklyInsight;
  @Lob public String accountabilitySummary;
  @Lob public String suggestedAdjustments;
  @Lob public String recommendedNextAction;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
