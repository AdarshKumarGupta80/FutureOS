package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "selected_futures")
public class SelectedFuture {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "future_branch_id", nullable = false)
  public FutureBranch futureBranch;
  @Column(nullable = false) public Instant selectedAt = Instant.now();
}
