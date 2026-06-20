package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "clarifications")
public class Clarification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Lob @Column(nullable = false) public String question;
  @Lob public String assumption;
  @Lob public String answer;
  public Double confidenceImpact = 0.0;
  @Column(nullable = false) public String status = "OPEN";
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
