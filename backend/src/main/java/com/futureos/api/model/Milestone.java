package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "milestones")
public class Milestone {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "roadmap_id", nullable = false)
  public Roadmap roadmap;
  @Column(nullable = false) public String title;
  public LocalDate targetDate;
  @Column(nullable = false) public String status = "PLANNED";
}
