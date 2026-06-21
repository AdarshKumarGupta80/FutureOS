package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

@Entity
@Table(name = "roadmaps")
public class Roadmap {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    public User user;
    @Column(nullable = false) public String title;
    @Lob @Column(columnDefinition = "TEXT") public String weeklyPlan;
    @Lob @Column(columnDefinition = "TEXT") public String monthlyPlan;
    @Lob @Column(columnDefinition = "TEXT") public String expectedOutcomes;
    @Lob @Column(columnDefinition = "TEXT") public String decisionTree;
    public Integer version = 1;
    @Lob @Column(columnDefinition = "TEXT") public String adaptationReason;
    @Column(nullable = false) public Instant createdAt = Instant.now();
}