package com.futureos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "decision_graphs")
public class DecisionGraph {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    public User user;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "roadmap_id")
    public Roadmap roadmap;
    @Column(nullable = false) public String title;
    @Lob @Column(nullable = false, columnDefinition = "TEXT") public String nodesJson;
    @Lob @Column(nullable = false, columnDefinition = "TEXT") public String edgesJson;
    @Column(nullable = false) public Instant createdAt = Instant.now();
}