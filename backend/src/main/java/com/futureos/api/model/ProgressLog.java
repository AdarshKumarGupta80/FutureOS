package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "progress_logs")
public class ProgressLog {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "task_id")
  public TaskItem task;
  @Lob @Column(nullable = false) public String note;
  @Column(nullable = false) public Instant createdAt = Instant.now();
}
