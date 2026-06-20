package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "gap_reports")
public class GapReport {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Lob public String currentState;
  @Lob public String selectedFuture;
  @Lob public String verifiedStrengths;
  @Lob public String missingSkills;
  @Lob public String missingProjects;
  @Lob public String missingExperience;
  @Lob public String missingCertifications;
  @Lob public String evidenceReasoning;
  public Double confidenceScore = 0.0;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
