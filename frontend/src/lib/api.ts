const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api";

export type OnboardingPayload = {
  goal: string;
  biggestConfusion: string;
  successDefinition: string;
  weeklyAvailableHours: number;
  background: string;
  resumeUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  projectZipUrl?: string;
};

export type FutureBranch = {
  id: number;
  title: string;
  whyItFits: string;
  risks: string;
  tradeoffs: string;
  lifestyleImpact: string;
  opportunities: string;
  skillsRequired: string;
  timeline: string;
  score: number;
  confidenceScore: number;
  assumptionsUsed: string;
  oneYearOutlook: string;
  threeYearOutlook: string;
  fiveYearOutlook: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  status: string;
  commitment: boolean;
};

export type Experiment = {
  id: number;
  title: string;
  hypothesis: string;
  durationDays: number;
  successMetric: string;
  status: string;
  outcome?: string;
};

export type Milestone = {
  id: number;
  title: string;
  targetDate?: string;
  status: string;
};

export type GapReport = {
  id: number;
  currentState: string;
  selectedFuture: string;
  verifiedStrengths: string;
  missingSkills: string;
  missingProjects: string;
  missingExperience: string;
  missingCertifications: string;
  evidenceReasoning: string;
  confidenceScore: number;
};

export type AccountabilityInsight = {
  id: number;
  completionRate: number;
  missedCommitments: number;
  consistencyScore: number;
  commonBlockers: string;
  weeklyInsight: string;
  accountabilitySummary: string;
  suggestedAdjustments: string;
  recommendedNextAction: string;
};

function token() {
  return localStorage.getItem("futureos_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const init: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  };
  const res = await fetch(`${API_BASE}${path}`, init);
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("futureos_token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text || `Request failed with status ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.detail)) {
        message = parsed.detail.map((item: any) => item.msg ?? "Validation error").join(". ");
      } else {
        message = parsed.message ?? parsed.detail ?? message;
      }
    } catch {
      // Keep the raw response text when the server did not return JSON.
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; fullName: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (fullName: string, email: string, password: string) =>
    request<{ token: string; fullName: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),
  dashboard: () => request<any>("/dashboard"),
  onboarding: (payload: OnboardingPayload) =>
    request<any>("/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  clarify: (id: number, answer: string) =>
    request<any>(`/clarifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ answer }),
    }),
  preferences: (payload: any) =>
    request<any>("/preferences", { method: "PUT", body: JSON.stringify(payload) }),
  regenerateFutures: () =>
    request<any>("/futures/regenerate", { method: "POST" }),
  selectFuture: (futureBranchId: number) =>
    request<any>("/futures/select", {
      method: "POST",
      body: JSON.stringify({ futureBranchId }),
    }),
  generateGap: () => request<GapReport>("/gap-analysis/generate", { method: "POST" }),
  generateRoadmap: () => request<any>("/roadmaps/generate", { method: "POST" }),
  createProgress: (payload: any) =>
    request<any>("/progress", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: number, status: string) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  createTask: (payload: any) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateExperiment: (id: number, status: string) =>
    request<any>(`/experiments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  accountability: (note: string) =>
    request<any>("/accountability", { method: "POST", body: JSON.stringify({ note }) }),
};
