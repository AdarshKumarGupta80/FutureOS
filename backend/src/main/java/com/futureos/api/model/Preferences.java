package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "preferences")
public class Preferences {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @JsonIgnore @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  public User user;
  public Integer financialSecurity = 5;
  public Integer careerGrowth = 5;
  public Integer autonomy = 5;
  public Integer riskTolerance = 5;
}
