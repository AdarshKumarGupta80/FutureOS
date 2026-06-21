package com.futureos.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "life_experiments")
public class LifeExperiment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    public User user;
    @Column(nullable = false) public String title;
    @Lob public String hypothesis;
    public Integer durationDays = 7;
    @Lob public String successMetric;
    @Column(nullable = false) public String status = "PLANNED";

    // --- Life Experiment Generator (Step 6) fields ---
    /** e.g. "AI Engineer" */
    @Column(name = "path_a") public String pathA;
    /** e.g. "Product Manager" */
    @Column(name = "path_b") public String pathB;
    /** JSON array of {day, pathA: {title, description}, pathB: {title, description}} */
    @Lob @Column(name = "day_plan_json", columnDefinition = "TEXT") public String dayPlanJson;
    /** JSON array of daily check-ins: {day, path, interest, difficulty, enjoyment, notes} */
    @Lob @Column(name = "checkins_json", columnDefinition = "TEXT") public String checkinsJson;
    /** Filled in once the user finishes all check-ins and requests a verdict */
    @Lob @Column(name = "verdict_json", columnDefinition = "TEXT") public String verdictJson;
}