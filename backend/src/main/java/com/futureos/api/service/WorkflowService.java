package com.futureos.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.futureos.api.dto.WorkflowDtos.*;
import com.futureos.api.model.*;
import com.futureos.api.repository.*;
import jakarta.transaction.Transactional;
import java.util.LinkedHashMap;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WorkflowService {
    private static final Logger log = LoggerFactory.getLogger(WorkflowService.class);

    private final ObjectMapper objectMapper;
    private final AiClient ai;
    private final ProfileRepository profiles;
    private final GoalRepository goals;
    private final ClarificationRepository clarifications;
    private final FutureBranchRepository futures;
    private final PreferencesRepository preferences;
    private final SelectedFutureRepository selectedFutures;
    private final GapReportRepository gapReports;
    private final RoadmapRepository roadmaps;
    private final MilestoneRepository milestones;
    private final TaskItemRepository tasks;
    private final LifeExperimentRepository experiments;
    private final ProgressLogRepository progressLogs;
    private final NotificationRepository notifications;
    private final DecisionGraphRepository decisionGraphs;
    private final RoadmapVersionRepository roadmapVersions;
    private final AccountabilityInsightRepository accountabilityInsights;

    public WorkflowService(ObjectMapper objectMapper, AiClient ai,
                           ProfileRepository profiles, GoalRepository goals,
                           ClarificationRepository clarifications, FutureBranchRepository futures,
                           PreferencesRepository preferences, SelectedFutureRepository selectedFutures,
                           GapReportRepository gapReports, RoadmapRepository roadmaps,
                           MilestoneRepository milestones, TaskItemRepository tasks,
                           LifeExperimentRepository experiments, ProgressLogRepository progressLogs,
                           NotificationRepository notifications, DecisionGraphRepository decisionGraphs,
                           RoadmapVersionRepository roadmapVersions,
                           AccountabilityInsightRepository accountabilityInsights) {
        this.objectMapper = objectMapper;
        this.ai = ai;
        this.profiles = profiles;
        this.goals = goals;
        this.clarifications = clarifications;
        this.futures = futures;
        this.preferences = preferences;
        this.selectedFutures = selectedFutures;
        this.gapReports = gapReports;
        this.roadmaps = roadmaps;
        this.milestones = milestones;
        this.tasks = tasks;
        this.experiments = experiments;
        this.progressLogs = progressLogs;
        this.notifications = notifications;
        this.decisionGraphs = decisionGraphs;
        this.roadmapVersions = roadmapVersions;
        this.accountabilityInsights = accountabilityInsights;
    }

    @Transactional
    public Map<String, Object> onboard(User user, OnboardingRequest request) {

        Profile profile = profiles.findByUser(user).orElseGet(Profile::new);
        profile.user = user;
        profile.background = request.background();
        profile.resumeUrl = request.resumeUrl();
        profile.githubUrl = request.githubUrl();
        profile.portfolioUrl = request.portfolioUrl();
        profile.projectZipUrl = request.projectZipUrl();
        profiles.save(profile);

        goals.deleteByUser(user);

        Goal goal = new Goal();
        goal.user = user;
        goal.goal = request.goal();
        goal.biggestConfusion = request.biggestConfusion();
        goal.successDefinition = request.successDefinition();
        goal.weeklyAvailableHours = request.weeklyAvailableHours();
        goals.save(goal);

        log.info("FutureOS WorkflowService.onboard — calling AI service for user {}", user.email);
        Map<String, Object> generated = ai.onboard(request);
        log.info("FutureOS WorkflowService.onboard — AI response keys: {}", generated.keySet());

        selectedFutures.deleteByUser(user);
        futures.deleteByUser(user);
        saveClarifications(user, (List<?>) generated.getOrDefault("clarifications", List.of()));
        saveFutures(user, (List<?>) generated.getOrDefault("futures", List.of()));
        ensurePreferences(user);
        return dashboard(user);
    }

    @Transactional
    public Map<String, Object> dashboard(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("profile",                  profiles.findByUser(user).orElse(null));
        data.put("goals",                    goals.findByUserOrderByCreatedAtDesc(user));
        data.put("clarifications",           clarifications.findByUserOrderByCreatedAtDesc(user));
        data.put("futureBranches",           futures.findByUserOrderByScoreDesc(user));
        data.put("preferences",              ensurePreferences(user));
        data.put("selectedFuture",           selectedFutures.findByUser(user).orElse(null));
        data.put("gapReports",               gapReports.findByUserOrderByCreatedAtDesc(user));
        data.put("roadmaps",                 roadmaps.findByUserOrderByCreatedAtDesc(user));
        data.put("roadmapVersions",          roadmapVersions.findByUserOrderByCreatedAtDesc(user));
        data.put("decisionGraphs",           decisionGraphs.findByUserOrderByCreatedAtDesc(user));
        data.put("milestones",               milestones.findByRoadmap_User(user));
        data.put("tasks",                    tasks.findByUser(user));
        data.put("experiments",              experiments.findByUser(user));
        data.put("progressLogs",             progressLogs.findByUserOrderByCreatedAtDesc(user));
        data.put("notifications",            notifications.findByUserOrderByCreatedAtDesc(user));
        data.put("accountabilityInsights",   accountabilityInsights.findByUserOrderByCreatedAtDesc(user));
        return data;
    }

    @Transactional
    public List<DecisionGraph> decisionGraphs(User user) {
        return decisionGraphs.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public List<RoadmapVersion> roadmapHistory(User user) {
        return roadmapVersions.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public List<AccountabilityInsight> accountabilityInsights(User user) {
        return accountabilityInsights.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Clarification answerClarification(User user, Long id, ClarificationAnswer request) {
        // findByIdAndUserId checks ownership in SQL — never touches the LAZY user proxy
        Clarification c = clarifications.findByIdAndUserId(id, user.id)
                .orElseThrow(() -> new IllegalArgumentException("Clarification not found or not yours"));
        c.answer = request.answer();
        c.status = "ANSWERED";
        return clarifications.save(c);
    }

    @Transactional
    public Preferences updatePreferences(User user, PreferencesRequest request) {
        Preferences p = ensurePreferences(user);
        p.financialSecurity = request.financialSecurity();
        p.careerGrowth = request.careerGrowth();
        p.autonomy = request.autonomy();
        p.riskTolerance = request.riskTolerance();
        preferences.save(p);
        rescoreFutures(user, p);
        regenerateFutures(user, "Preference sliders changed");
        return p;
    }

    @Transactional
    public SelectedFuture selectFuture(User user, SelectFutureRequest request) {
        // findByIdAndUserId checks ownership in SQL — never touches the LAZY user proxy
        FutureBranch branch = futures.findByIdAndUserId(request.futureBranchId(), user.id)
                .orElseThrow(() -> new IllegalArgumentException("Future branch not found or not yours"));
        // Delete any existing selection first to avoid unique-constraint violation
        // (the @OneToOne user_id column has a UNIQUE index — upsert via orElseGet
        // fails when JPA issues an INSERT instead of UPDATE for a detached entity)
        selectedFutures.deleteByUser(user);
        selectedFutures.flush();
        SelectedFuture selected = new SelectedFuture();
        selected.user = user;
        selected.futureBranch = branch;
        return selectedFutures.save(selected);
    }

    @Transactional
    public GapReport generateGap(User user) {
        SelectedFuture selected = selectedFutures.findByUser(user).orElseThrow();
        Profile profile = profiles.findByUser(user).orElse(null);

        // Bug 7 fix: use LinkedHashMap instead of Map.of() to safely hold
        // empty-string values without risk of NullPointerException.
        Map<String, Object> gapPayload = new LinkedHashMap<>();
        gapPayload.put("background",   profile == null ? "" : string(profile.background));
        gapPayload.put("future",       string(selected.futureBranch.title));
        gapPayload.put("resumeUrl",    profile == null ? "" : string(profile.resumeUrl));
        gapPayload.put("githubUrl",    profile == null ? "" : string(profile.githubUrl));
        gapPayload.put("portfolioUrl", profile == null ? "" : string(profile.portfolioUrl));
        gapPayload.put("projectZipUrl",profile == null ? "" : string(profile.projectZipUrl));

        Map<String, Object> generated = ai.gap(gapPayload);
        GapReport report = new GapReport();
        report.user = user;
        report.currentState = string(generated.get("currentState"));
        report.selectedFuture = string(generated.get("selectedFuture"));
        report.verifiedStrengths = string(generated.get("verifiedStrengths"));
        report.missingSkills = string(generated.get("missingSkills"));
        report.missingProjects = string(generated.get("missingProjects"));
        report.missingExperience = string(generated.get("missingExperience"));
        report.missingCertifications = string(generated.get("missingCertifications"));
        report.evidenceReasoning = string(generated.get("evidenceReasoning"));
        report.confidenceScore = number(generated.get("confidenceScore"));
        return gapReports.save(report);
    }

    @Transactional
    public Roadmap generateRoadmap(User user) {
        SelectedFuture selected = selectedFutures.findByUser(user).orElseThrow();
        GapReport latestGap = gapReports.findByUserOrderByCreatedAtDesc(user).stream().findFirst().orElse(null);

        Map<String, Object> roadmapPayload = new LinkedHashMap<>();
        roadmapPayload.put("future", string(selected.futureBranch.title));
        roadmapPayload.put("gap", latestGap == null ? "" : string(latestGap.missingSkills));

        Map<String, Object> generated = ai.roadmap(roadmapPayload);
        Roadmap roadmap = new Roadmap();
        roadmap.user = user;
        roadmap.title = string(generated.get("title"));
        roadmap.weeklyPlan = string(generated.get("weeklyPlan"));
        roadmap.monthlyPlan = string(generated.get("monthlyPlan"));
        roadmap.expectedOutcomes = string(generated.get("expectedOutcomes"));
        roadmap.decisionTree = string(generated.get("decisionTree"));
        roadmap.version = nextRoadmapVersion(user);
        roadmap.adaptationReason = "Initial roadmap generation";
        roadmaps.save(roadmap);
        saveRoadmapVersion(user, roadmap, generated, roadmap.adaptationReason);
        saveDecisionGraph(user, roadmap, generated);
        saveMilestonesTasksAndExperiments(user, roadmap, generated);
        return roadmap;
    }

    @Transactional
    public ProgressLog progress(User user, ProgressRequest request) {
        ProgressLog log = new ProgressLog();
        log.user = user;
        log.note = request.note();
        if (request.taskId() != null) {
            log.task = tasks.findById(request.taskId()).orElse(null);
        }
        return progressLogs.save(log);
    }

    @Transactional
    public TaskItem updateTask(User user, Long id, TaskStatusRequest request) {
        TaskItem task = tasks.findById(id).orElseThrow();
        if (!task.user.id.equals(user.id)) throw new IllegalArgumentException("Not your task");
        task.status = request.status();
        TaskItem saved = tasks.save(task);
        adaptRoadmapFromProgress(user, "DONE".equalsIgnoreCase(request.status()) ? "Task completed" : "Task reopened or missed");
        return saved;
    }

    @Transactional
    public TaskItem createTask(User user, CreateTaskRequest request) {
        TaskItem task = new TaskItem();
        task.user = user;
        task.title = request.title();
        task.description = request.description();
        task.commitment = request.commitment() != null && request.commitment();
        if (request.dueDate() != null && !request.dueDate().isBlank()) {
            task.dueDate = LocalDate.parse(request.dueDate());
        }
        return tasks.save(task);
    }

    @Transactional
    public LifeExperiment updateExperiment(User user, Long id, ExperimentStatusRequest request) {
        LifeExperiment experiment = experiments.findById(id).orElseThrow();
        if (!experiment.user.id.equals(user.id)) throw new IllegalArgumentException("Not your experiment");
        experiment.status = request.status();
        return experiments.save(experiment);
    }

    @Transactional
    public MessageResponse accountability(User user, AccountabilityRequest request) {
        ProgressLog log = new ProgressLog();
        log.user = user;
        log.note = "Accountability: " + request.note();
        progressLogs.save(log);

        Notification notification = new Notification();
        notification.user = user;
        notification.message = "Roadmap signal recorded. Review tasks and adjust this week's commitment.";
        notifications.save(notification);

        TaskItem adjustment = new TaskItem();
        adjustment.user = user;
        adjustment.title = "Adjusted next commitment";
        adjustment.description = "Based on accountability feedback: " + request.note();
        adjustment.commitment = true;
        adjustment.dueDate = LocalDate.now().plusDays(7);
        tasks.save(adjustment);

        AccountabilityInsight insight = generateAccountabilityInsight(user, request.note());
        adaptRoadmapFromProgress(user, "Accountability feedback: " + request.note());

        return new MessageResponse("Recorded. " + insight.recommendedNextAction);
    }

    @Transactional
    public Map<String, Object> regenerateFutures(User user, String reason) {
        Goal latestGoal = goals.findByUserOrderByCreatedAtDesc(user).stream().findFirst().orElseThrow();
        Profile profile = profiles.findByUser(user).orElse(null);
        Preferences p = ensurePreferences(user);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("goal",                latestGoal.goal);
        request.put("biggestConfusion",    latestGoal.biggestConfusion);
        request.put("successDefinition",   latestGoal.successDefinition);
        request.put("weeklyAvailableHours",latestGoal.weeklyAvailableHours);
        request.put("background",          profile == null ? "" : string(profile.background));
        request.put("resumeUrl",           profile == null ? "" : string(profile.resumeUrl));
        request.put("githubUrl",           profile == null ? "" : string(profile.githubUrl));
        request.put("portfolioUrl",        profile == null ? "" : string(profile.portfolioUrl));
        request.put("projectZipUrl",       profile == null ? "" : string(profile.projectZipUrl));
        request.put("preferences", Map.of(
                "financialSecurity", p.financialSecurity,
                "careerGrowth",      p.careerGrowth,
                "autonomy",          p.autonomy,
                "riskTolerance",     p.riskTolerance
        ));
        request.put("clarifications", clarifications.findByUserOrderByCreatedAtDesc(user).stream()
                .map(c -> Map.of(
                        "assumption", string(c.assumption),
                        "question",   string(c.question),
                        "answer",     string(c.answer)))
                .collect(Collectors.toList()));

        Map<String, Object> generated = ai.simulateFutures(request);
        selectedFutures.deleteByUser(user);
        futures.deleteByUser(user);
        saveClarifications(user, (List<?>) generated.getOrDefault("clarifications", List.of()));
        saveFutures(user, (List<?>) generated.getOrDefault("futures", List.of()));
        return dashboard(user);
    }

    private Preferences ensurePreferences(User user) {
        return preferences.findByUser(user).orElseGet(() -> {
            Preferences p = new Preferences();
            p.user = user;
            return preferences.save(p);
        });
    }

    private void saveClarifications(User user, List<?> items) {
        for (Object item : items) {
            Clarification c = new Clarification();
            c.user = user;
            if (item instanceof Map<?, ?> map) {
                c.assumption = string(map.get("assumption"));
                c.question = string(map.get("question"));
                c.confidenceImpact = number(map.get("confidenceImpact"));
            } else {
                c.question = string(item);
            }
            clarifications.save(c);
        }
    }

    @SuppressWarnings("unchecked")
    private void saveFutures(User user, List<?> items) {
        for (Object item : items) {
            Map<String, Object> m = (Map<String, Object>) item;
            FutureBranch f = new FutureBranch();
            f.user = user;
            f.title = string(m.get("title"));
            f.whyItFits = string(m.get("whyItFits"));
            f.risks = string(m.get("risks"));
            f.tradeoffs = string(m.get("tradeoffs"));
            f.lifestyleImpact = string(m.get("lifestyleImpact"));
            f.opportunities = string(m.get("opportunities"));
            f.skillsRequired = string(m.get("skillsRequired"));
            f.timeline = string(m.get("timeline"));
            f.score = number(m.get("score"));
            f.confidenceScore = number(m.get("confidenceScore"));
            f.assumptionsUsed = string(m.get("assumptionsUsed"));
            f.oneYearOutlook = string(m.get("oneYearOutlook"));
            f.threeYearOutlook = string(m.get("threeYearOutlook"));
            f.fiveYearOutlook = string(m.get("fiveYearOutlook"));
            futures.save(f);
        }
    }

    private void rescoreFutures(User user, Preferences p) {
        for (FutureBranch f : futures.findByUserOrderByScoreDesc(user)) {
            double riskAlignment    = f.title.toLowerCase().contains("founder") ? p.riskTolerance * 8 : (11 - Math.abs(6 - p.riskTolerance)) * 6;
            double growthAlignment  = p.careerGrowth * 7;
            double autonomyAlignment = (f.title.toLowerCase().contains("product") || f.title.toLowerCase().contains("founder")) ? p.autonomy * 7 : p.autonomy * 5;
            double securityAlignment = f.title.toLowerCase().contains("founder") ? p.financialSecurity * 3 : p.financialSecurity * 7;
            f.score = (riskAlignment + growthAlignment + autonomyAlignment + securityAlignment) / 3.0;
            futures.save(f);
        }
    }

    @SuppressWarnings("unchecked")
    private void saveDecisionGraph(User user, Roadmap roadmap, Map<String, Object> generated) {
        Object graph = generated.get("graph");
        Map<String, Object> graphMap = graph instanceof Map<?, ?> m
                ? (Map<String, Object>) m
                : Map.of(
                "nodes", List.of(Map.of("id", "future", "label", roadmap.title, "type", "future")),
                "edges", List.of());
        DecisionGraph decisionGraph = new DecisionGraph();
        decisionGraph.user = user;
        decisionGraph.roadmap = roadmap;
        decisionGraph.title = roadmap.title;
        decisionGraph.nodesJson = json(graphMap.get("nodes"));
        decisionGraph.edgesJson = json(graphMap.get("edges"));
        decisionGraphs.save(decisionGraph);
    }

    private void saveRoadmapVersion(User user, Roadmap roadmap, Map<String, Object> generated, String reason) {
        RoadmapVersion version = new RoadmapVersion();
        version.user = user;
        version.roadmap = roadmap;
        version.version = roadmap.version;
        version.reason = reason;
        version.snapshotJson = json(generated);
        roadmapVersions.save(version);
    }

    private int nextRoadmapVersion(User user) {
        return roadmapVersions.findByUserOrderByCreatedAtDesc(user).stream()
                .map(v -> v.version == null ? 0 : v.version)
                .findFirst()
                .orElse(0) + 1;
    }

    private void adaptRoadmapFromProgress(User user, String reason) {
        Roadmap latest = roadmaps.findByUserOrderByCreatedAtDesc(user).stream().findFirst().orElse(null);
        if (latest == null) return;
        long total = tasks.findByUser(user).size();
        long done  = tasks.findByUser(user).stream().filter(t -> "DONE".equalsIgnoreCase(t.status)).count();
        String pace = total > 0 && done * 1.0 / total >= 0.7 ? "Accelerated" : "Adjusted";
        latest.version = nextRoadmapVersion(user);
        latest.adaptationReason = pace + ": " + reason;
        if ("Accelerated".equals(pace)) {
            latest.weeklyPlan = latest.weeklyPlan + "\n\nAcceleration: add one stretch proof task this week.";
        } else {
            latest.weeklyPlan = latest.weeklyPlan + "\n\nAdjustment: reduce scope and protect one focused execution block.";
        }
        roadmaps.save(latest);
        saveRoadmapVersion(user, latest, Map.of(
                "weeklyPlan",       latest.weeklyPlan,
                "monthlyPlan",      latest.monthlyPlan,
                "expectedOutcomes", latest.expectedOutcomes,
                "reason",           latest.adaptationReason
        ), latest.adaptationReason);
    }

    private AccountabilityInsight generateAccountabilityInsight(User user, String note) {
        List<TaskItem> userTasks = tasks.findByUser(user);
        long totalCommitments = userTasks.stream().filter(t -> Boolean.TRUE.equals(t.commitment)).count();
        long completed = userTasks.stream().filter(t -> Boolean.TRUE.equals(t.commitment) && "DONE".equalsIgnoreCase(t.status)).count();
        double completionRate = totalCommitments == 0 ? 0 : (completed * 100.0 / totalCommitments);
        int missed = (int) userTasks.stream().filter(t -> Boolean.TRUE.equals(t.commitment) && !"DONE".equalsIgnoreCase(t.status)).count();

        Map<String, Object> accountabilityPayload = new LinkedHashMap<>();
        accountabilityPayload.put("completionRate",     completionRate);
        accountabilityPayload.put("missedCommitments",  missed);
        accountabilityPayload.put("accountabilityNote", string(note));
        accountabilityPayload.put("recentLogs", progressLogs.findByUserOrderByCreatedAtDesc(user).stream()
                .limit(5).map(l -> l.note).collect(Collectors.toList()));

        Map<String, Object> generated = ai.accountability(accountabilityPayload);
        AccountabilityInsight insight = new AccountabilityInsight();
        insight.user = user;
        insight.completionRate = completionRate;
        insight.missedCommitments = missed;
        insight.consistencyScore = Math.max(0, Math.min(100, completionRate - missed * 5.0 + 20));
        insight.commonBlockers = string(generated.get("commonBlockers"));
        insight.weeklyInsight = string(generated.get("weeklyInsight"));
        insight.accountabilitySummary = string(generated.get("accountabilitySummary"));
        insight.suggestedAdjustments = string(generated.get("suggestedAdjustments"));
        insight.recommendedNextAction = string(generated.get("recommendedNextAction"));
        return accountabilityInsights.save(insight);
    }

    @SuppressWarnings("unchecked")
    private void saveMilestonesTasksAndExperiments(User user, Roadmap roadmap, Map<String, Object> generated) {
        List<?> milestoneTitles = (List<?>) generated.getOrDefault("milestones", List.of("Foundation", "Proof", "Launch"));
        int index = 1;
        for (Object title : milestoneTitles) {
            Milestone milestone = new Milestone();
            milestone.roadmap = roadmap;
            milestone.title = string(title);
            milestone.targetDate = LocalDate.now().plusWeeks(index * 2L);
            milestones.save(milestone);
            index++;
        }

        for (Object title : (List<?>) generated.getOrDefault("tasks", List.of("Commit to first weekly action"))) {
            TaskItem task = new TaskItem();
            task.user = user;
            task.title = string(title);
            task.description = "Generated by FutureOS roadmap compiler.";
            task.commitment = true;
            task.dueDate = LocalDate.now().plusDays(7);
            tasks.save(task);
        }

        for (Object item : (List<?>) generated.getOrDefault("experiments", List.of())) {
            Map<String, Object> m = (Map<String, Object>) item;
            LifeExperiment experiment = new LifeExperiment();
            experiment.user = user;
            experiment.title = string(m.get("title"));
            experiment.hypothesis = string(m.get("hypothesis"));
            experiment.durationDays = (int) number(m.get("durationDays"));
            experiment.successMetric = string(m.get("successMetric"));
            experiments.save(experiment);
        }
    }

    private String string(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    private double number(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(string(value));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
}