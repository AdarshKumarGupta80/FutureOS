package com.futureos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "roadmap_versions")
public class RoadmapVersion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    public User user;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "roadmap_id", nullable = false)
    public Roadmap roadmap;
    public Integer version;
    @Lob @Column(columnDefinition = "LONGTEXT") public String reason;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") public String snapshotJson;
    @Column(nullable = false) public Instant createdAt = Instant.now();
}