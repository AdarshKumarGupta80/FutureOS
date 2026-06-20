package com.futureos.api.config;

import com.futureos.api.model.*;
import com.futureos.api.repository.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataSeeder implements CommandLineRunner {
    private final UserRepository users;
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
    private final AccountabilityInsightRepository insights;
    private final DecisionGraphRepository decisionGraphs;
    private final RoadmapVersionRepository roadmapVersions;
    private final PasswordEncoder encoder;

    @Value("${futureos.seed-data:false}")
    private boolean seedData;

    public DemoDataSeeder(UserRepository users, ProfileRepository profiles, GoalRepository goals, ClarificationRepository clarifications,
                          FutureBranchRepository futures, PreferencesRepository preferences, SelectedFutureRepository selectedFutures,
                          GapReportRepository gapReports, RoadmapRepository roadmaps, MilestoneRepository milestones, TaskItemRepository tasks,
                          LifeExperimentRepository experiments, ProgressLogRepository progressLogs, AccountabilityInsightRepository insights,
                          DecisionGraphRepository decisionGraphs, RoadmapVersionRepository roadmapVersions, PasswordEncoder encoder) {
        this.users = users;
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
        this.insights = insights;
        this.decisionGraphs = decisionGraphs;
        this.roadmapVersions = roadmapVersions;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedData) {
            return;
        }
        seed("student.ai@futureos.dev", "Student AI Engineer", "AI Engineer", 88);
        seed("student.founder@futureos.dev", "Student Founder", "Startup Founder", 76);
        seed("switcher@futureos.dev", "Career Switcher", "Product Manager", 81);
    }

    @Transactional
    private void seed(String email, String name, String selectedTitle, int score) {
        if (users.existsByEmail(email)) return;

        User user = new User();
        user.email = email;
        user.fullName = name;
        user.passwordHash = encoder.encode("password123");
        users.save(user);

        Profile profile = new Profile();
        profile.user = user;
        profile.background = "Demo profile with Java, React, project work, and evidence links for portfolio review.";
        profile.githubUrl = "https://github.com/demo/futureos";
        profile.portfolioUrl = "https://portfolio.example.com";
        profiles.save(profile);

        Goal goal = new Goal();
        goal.user = user;
        goal.goal = "Choose a future path and build a credible 12 week execution plan.";
        goal.biggestConfusion = "Choosing between AI, product, and entrepreneurship.";
        goal.successDefinition = "A clear direction, visible proof, and weekly accountability.";
        goal.weeklyAvailableHours = 12;
        goals.save(goal);

        Preferences pref = new Preferences();
        pref.user = user;
        pref.financialSecurity = selectedTitle.contains("Founder") ? 5 : 8;
        pref.careerGrowth = 9;
        pref.autonomy = selectedTitle.contains("Founder") ? 9 : 7;
        pref.riskTolerance = selectedTitle.contains("Founder") ? 8 : 5;
        preferences.save(pref);

        Clarification clarification = new Clarification();
        clarification.user = user;
        clarification.assumption = "Risk boundary";
        clarification.question = "Would you trade short-term stability for faster learning?";
        clarification.answer = selectedTitle.contains("Founder") ? "Yes, if the experiment is time-boxed." : "Only with a stable safety plan.";
        clarification.confidenceImpact = 18.0;
        clarification.status = "ANSWERED";
        clarifications.save(clarification);

        FutureBranch selected = future(user, selectedTitle, score);
        futures.save(selected);
        futures.save(future(user, "AI Engineer".equals(selectedTitle) ? "Product Manager" : "AI Engineer", score - 8));
        futures.save(future(user, "Startup Founder".equals(selectedTitle) ? "Data Scientist" : "Startup Founder", score - 14));

        SelectedFuture selectedFuture = new SelectedFuture();
        selectedFuture.user = user;
        selectedFuture.futureBranch = selected;
        selectedFutures.save(selectedFuture);

        GapReport gap = new GapReport();
        gap.user = user;
        gap.currentState = profile.background;
        gap.selectedFuture = selectedTitle;
        gap.verifiedStrengths = "Java backend foundation, React UI practice, consistent project momentum.";
        gap.missingSkills = "Role-specific depth, stronger proof artifacts, and interview-ready storytelling.";
        gap.missingProjects = "One flagship project and one public case study tied to the selected future.";
        gap.missingExperience = "Mentor feedback, real users, and internship or launch-style practice.";
        gap.missingCertifications = "Optional certification after project proof is complete.";
        gap.evidenceReasoning = "GitHub and portfolio evidence support baseline execution; production proof is still limited.";
        gap.confidenceScore = 74.0;
        gapReports.save(gap);

        Roadmap roadmap = new Roadmap();
        roadmap.user = user;
        roadmap.title = "12 Week " + selectedTitle + " Roadmap";
        roadmap.weeklyPlan = "Week 1: clarify proof target.\nWeek 2: build first slice.\nWeek 3: publish and get feedback.";
        roadmap.monthlyPlan = "Month 1: foundations. Month 2: project proof. Month 3: outreach and iteration.";
        roadmap.expectedOutcomes = "A focused path, credible proof, and a repeatable accountability rhythm.";
        roadmap.decisionTree = selectedTitle + "\n-> Foundation\n-> Proof Project\n-> Feedback\n-> Opportunity";
        roadmap.version = 1;
        roadmap.adaptationReason = "Demo baseline";
        roadmaps.save(roadmap);

        for (int i = 1; i <= 4; i++) {
            Milestone milestone = new Milestone();
            milestone.roadmap = roadmap;
            milestone.title = List.of("Clarify target", "Build proof", "Publish portfolio", "Outreach sprint").get(i - 1);
            milestone.targetDate = LocalDate.now().plusWeeks(i * 2L);
            milestone.status = i == 1 ? "DONE" : "PLANNED";
            milestones.save(milestone);
        }

        task(user, "Finish first proof slice", "Ship a small visible outcome this week.", "DONE");
        task(user, "Ask for mentor feedback", "Collect feedback from two people.", "TODO");
        task(user, "Update portfolio case study", "Document decision, process, and result.", "TODO");

        LifeExperiment experiment = new LifeExperiment();
        experiment.user = user;
        experiment.title = selectedTitle + " 7 Day Reality Test";
        experiment.hypothesis = "A realistic micro-task will reveal energy and fit.";
        experiment.durationDays = 7;
        experiment.successMetric = "Three focused sessions completed and energy rated above 7/10.";
        experiment.status = "RUNNING";
        experiments.save(experiment);

        ProgressLog log = new ProgressLog();
        log.user = user;
        log.note = "Completed first planning session and selected a proof artifact.";
        progressLogs.save(log);

        AccountabilityInsight insight = new AccountabilityInsight();
        insight.user = user;
        insight.completionRate = 33.0;
        insight.missedCommitments = 2;
        insight.consistencyScore = 55.0;
        insight.commonBlockers = "Context switching and oversized weekly commitments.";
        insight.weeklyInsight = "Progress improves when the next task is small and visible.";
        insight.accountabilitySummary = "One commitment completed, two still open.";
        insight.suggestedAdjustments = "Reduce this week to one primary proof task and one feedback action.";
        insight.recommendedNextAction = "Finish the proof slice and log what changed.";
        insights.save(insight);

        DecisionGraph graph = new DecisionGraph();
        graph.user = user;
        graph.roadmap = roadmap;
        graph.title = roadmap.title;
        graph.nodesJson = "[{\"id\":\"future\",\"label\":\"" + selectedTitle + "\",\"type\":\"future\"},{\"id\":\"foundation\",\"label\":\"Foundation\",\"type\":\"skill\"},{\"id\":\"project\",\"label\":\"Proof Project\",\"type\":\"proof\"},{\"id\":\"outreach\",\"label\":\"Opportunity\",\"type\":\"outcome\"}]";
        graph.edgesJson = "[{\"from\":\"future\",\"to\":\"foundation\"},{\"from\":\"foundation\",\"to\":\"project\"},{\"from\":\"project\",\"to\":\"outreach\"}]";
        decisionGraphs.save(graph);

        RoadmapVersion version = new RoadmapVersion();
        version.user = user;
        version.roadmap = roadmap;
        version.version = 1;
        version.reason = "Demo baseline";
        version.snapshotJson = "{\"status\":\"seeded\"}";
        roadmapVersions.save(version);
    }

    private FutureBranch future(User user, String title, int score) {
        FutureBranch branch = new FutureBranch();
        branch.user = user;
        branch.title = title;
        branch.score = (double) score;
        branch.confidenceScore = Math.max(50.0, score - 10.0);
        branch.whyItFits = "Matches the user's current evidence, goals, and weekly capacity.";
        branch.opportunities = "Strong portfolio leverage, practical learning, and visible progress.";
        branch.risks = "Requires focus, feedback, and consistent execution.";
        branch.tradeoffs = "Depth in this path means saying no to some adjacent options.";
        branch.lifestyleImpact = "Weekly deep work, project reviews, and focused skill practice.";
        branch.skillsRequired = "Core foundations, project execution, communication, and feedback loops.";
        branch.timeline = "12 weeks for credible proof, 6-12 months for stronger market readiness.";
        branch.assumptionsUsed = "Seeded from demo profile, stated goals, preferences, and clarification answers.";
        branch.oneYearOutlook = "Portfolio proof and early opportunity pipeline.";
        branch.threeYearOutlook = "Stronger ownership and specialization.";
        branch.fiveYearOutlook = "Senior, founder, or high-autonomy path options.";
        return branch;
    }

    private void task(User user, String title, String description, String status) {
        TaskItem task = new TaskItem();
        task.user = user;
        task.title = title;
        task.description = description;
        task.status = status;
        task.commitment = true;
        task.dueDate = LocalDate.now().plusDays(7);
        tasks.save(task);
    }
}