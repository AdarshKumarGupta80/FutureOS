package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class TaskItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "milestone_id")
  public Milestone milestone;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @Column(nullable = false) public String title;
  @Lob public String description;
  public LocalDate dueDate;
  @Column(nullable = false) public String status = "TODO";
  @Column(nullable = false) public Boolean commitment = false;
}
