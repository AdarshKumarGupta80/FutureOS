package com.futureos.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @Column(nullable = false, unique = true)
  public String email;
  @Column(name = "password_hash", nullable = false)
  public String passwordHash;
  @Column(name = "full_name", nullable = false)
  public String fullName;
  @Column(nullable = false)
  public String role = "USER";
  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
