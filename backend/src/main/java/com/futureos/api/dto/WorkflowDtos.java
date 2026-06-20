package com.futureos.api.dto;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;

public class WorkflowDtos {

    public record OnboardingRequest(
            @NotBlank
            String goal,
            @NotBlank
            String biggestConfusion,
            @NotBlank
            String successDefinition,
            @NotNull @Min(1) @Max(80)
            Integer weeklyAvailableHours,
            @NotBlank
            String background,
            String resumeUrl,
            String githubUrl,
            String portfolioUrl,
            String projectZipUrl
    ) {}

    public record ClarificationAnswer(@NotBlank String answer) {}
    public record PreferencesRequest(
            @NotNull @Min(1) @Max(10) Integer financialSecurity,
            @NotNull @Min(1) @Max(10) Integer careerGrowth,
            @NotNull @Min(1) @Max(10) Integer autonomy,
            @NotNull @Min(1) @Max(10) Integer riskTolerance
    ) {}
    public record SelectFutureRequest(@NotNull Long futureBranchId) {}
    public record ProgressRequest(@NotBlank String note, Long taskId) {}
    public record TaskStatusRequest(
            @NotBlank @Pattern(regexp = "TODO|DONE|BLOCKED|RUNNING") String status
    ) {}
    public record CreateTaskRequest(
            @NotBlank String title,
            String description,
            String dueDate,
            Boolean commitment
    ) {}
    public record ExperimentStatusRequest(
            @NotBlank @Pattern(regexp = "PLANNED|RUNNING|DONE|BLOCKED") String status
    ) {}
    public record GenerateExperimentRequest(
            @NotBlank String pathA,
            @NotBlank String pathB,
            @Min(1) @Max(30) Integer durationDays
    ) {}
    public record ExperimentCheckinRequest(
            @NotNull @Min(1) @Max(7) Integer day,
            @NotBlank @Pattern(regexp = "A|B") String path,
            @NotNull @Min(1) @Max(5) Integer interest,
            @NotNull @Min(1) @Max(5) Integer difficulty,
            @NotNull @Min(1) @Max(5) Integer enjoyment,
            String notes
    ) {}
    public record AccountabilityRequest(@NotBlank String note) {}
    public record MessageResponse(String message) {}
    public record AdvanceMilestoneRequest(@NotNull Long milestoneId) {}
}