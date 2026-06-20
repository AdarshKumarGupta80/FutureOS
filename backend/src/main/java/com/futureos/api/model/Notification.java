package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    public User user;
    @Column(nullable = false, columnDefinition = "LONGTEXT") public String message;
    public Boolean readFlag = false;
    @Column(nullable = false) public Instant createdAt = Instant.now();
}