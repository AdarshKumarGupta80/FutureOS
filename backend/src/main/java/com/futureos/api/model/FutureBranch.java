package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "future_branches")
public class FutureBranch {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Column(nullable = false) public String title;
  @Lob public String whyItFits;
  @Lob public String risks;
  @Lob public String tradeoffs;
  @Lob public String lifestyleImpact;
  @Lob public String opportunities;
  @Lob public String skillsRequired;
  @Lob public String timeline;
  public Double score = 0.0;
  public Double confidenceScore = 0.0;
  @Lob public String assumptionsUsed;
  @Lob public String oneYearOutlook;
  @Lob public String threeYearOutlook;
  @Lob public String fiveYearOutlook;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
