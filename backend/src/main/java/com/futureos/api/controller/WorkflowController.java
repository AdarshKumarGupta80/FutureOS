package com.futureos.api.controller;

import com.futureos.api.dto.WorkflowDtos.*;
import com.futureos.api.model.*;
import com.futureos.api.service.CurrentUserService;
import com.futureos.api.service.WorkflowService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class WorkflowController {
    private static final Logger log = LoggerFactory.getLogger(WorkflowController.class);
    private final CurrentUserService currentUser;
    private final WorkflowService workflow;
    private final ObjectMapper objectMapper;

    public WorkflowController(CurrentUserService currentUser,
                              WorkflowService workflow,
                              ObjectMapper objectMapper) {
        this.currentUser = currentUser;
        this.workflow = workflow;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return workflow.dashboard(currentUser.get());
    }

    @PostMapping("/onboarding")
    public Map<String, Object> onboard(@Valid @RequestBody OnboardingRequest request) {
        log.info("FutureOS /api/onboarding — DTO received:");
        log.info("  goal:                 {}", request.goal());
        log.info("  biggestConfusion:     {}", request.biggestConfusion());
        log.info("  successDefinition:    {}", request.successDefinition());
        log.info("  weeklyAvailableHours: {}", request.weeklyAvailableHours());
        log.info("  background length:    {}", request.background() == null ? "null" : request.background().length());
        log.info("  resumeUrl:            {}", request.resumeUrl());
        log.info("  githubUrl:            {}", request.githubUrl());
        log.info("  portfolioUrl:         {}", request.portfolioUrl());
        log.info("  projectZipUrl:        {}", request.projectZipUrl());
        try {
            log.info("FutureOS /api/onboarding — full DTO JSON: {}",
                    objectMapper.writeValueAsString(request));
        } catch (JsonProcessingException ignored) {}

        return workflow.onboard(currentUser.get(), request);
    }

    @PostMapping("/futures/regenerate")
    public Map<String, Object> regenerateFutures() {
        return workflow.regenerateFutures(currentUser.get(), "Manual future simulation refresh");
    }

    @PatchMapping("/clarifications/{id}")
    public Clarification answerClarification(@PathVariable Long id,
                                             @Valid @RequestBody ClarificationAnswer request) {
        return workflow.answerClarification(currentUser.get(), id, request);
    }

    @PutMapping("/preferences")
    public Preferences preferences(@Valid @RequestBody PreferencesRequest request) {
        return workflow.updatePreferences(currentUser.get(), request);
    }

    @PostMapping("/futures/select")
    public SelectedFuture selectFuture(@Valid @RequestBody SelectFutureRequest request) {
        return workflow.selectFuture(currentUser.get(), request);
    }

    @PostMapping("/gap-analysis/generate")
    public GapReport gap() {
        return workflow.generateGap(currentUser.get());
    }

    @PostMapping("/roadmaps/generate")
    public Roadmap roadmap() {
        return workflow.generateRoadmap(currentUser.get());
    }


    @PostMapping("/roadmap/advance")
    public Map<String, Object> advanceMilestone(@Valid @RequestBody AdvanceMilestoneRequest request) {
        return workflow.advanceMilestone(currentUser.get(), request.milestoneId());
    }

    @GetMapping("/decision-graphs")
    public java.util.List<DecisionGraph> decisionGraphs() {
        return workflow.decisionGraphs(currentUser.get());
    }

    @GetMapping("/roadmaps/history")
    public java.util.List<RoadmapVersion> roadmapHistory() {
        return workflow.roadmapHistory(currentUser.get());
    }

    @PostMapping("/progress")
    public ProgressLog progress(@Valid @RequestBody ProgressRequest request) {
        return workflow.progress(currentUser.get(), request);
    }

    @PatchMapping("/tasks/{id}")
    public TaskItem updateTask(@PathVariable Long id,
                               @Valid @RequestBody TaskStatusRequest request) {
        return workflow.updateTask(currentUser.get(), id, request);
    }

    @PostMapping("/tasks")
    public TaskItem createTask(@Valid @RequestBody CreateTaskRequest request) {
        return workflow.createTask(currentUser.get(), request);
    }

    @PatchMapping("/experiments/{id}")
    public LifeExperiment updateExperiment(@PathVariable Long id,
                                           @Valid @RequestBody ExperimentStatusRequest request) {
        return workflow.updateExperiment(currentUser.get(), id, request);
    }

    @PostMapping("/experiments/generate")
    public LifeExperiment generateExperiment(@Valid @RequestBody GenerateExperimentRequest request) {
        return workflow.generateLifeExperiment(currentUser.get(), request);
    }

    @PostMapping("/experiments/{id}/checkins")
    public LifeExperiment recordCheckin(@PathVariable Long id,
                                        @Valid @RequestBody ExperimentCheckinRequest request) {
        return workflow.recordExperimentCheckin(currentUser.get(), id, request);
    }

    @PostMapping("/experiments/{id}/verdict")
    public LifeExperiment experimentVerdict(@PathVariable Long id) {
        return workflow.getExperimentVerdict(currentUser.get(), id);
    }

    @PostMapping("/accountability")
    public MessageResponse accountability(@Valid @RequestBody AccountabilityRequest request) {
        return workflow.accountability(currentUser.get(), request);
    }

    @GetMapping("/accountability/insights")
    public java.util.List<AccountabilityInsight> accountabilityInsights() {
        return workflow.accountabilityInsights(currentUser.get());
    }
}