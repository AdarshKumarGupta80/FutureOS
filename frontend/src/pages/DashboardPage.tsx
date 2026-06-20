import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState, ProgressBar } from "../components/ui/State";
import { api } from "../lib/api";

const STEP_ICONS: Record<string, string> = {
  "AI Onboarding":    "ti-sparkles",
  "Assumptions":      "ti-shield-check",
  "Future Simulation":"ti-git-branch",
  "Preferences":      "ti-adjustments-horizontal",
  "Select Future":    "ti-target",
  "Gap Analysis":     "ti-chart-bar",
  "Roadmap":          "ti-map",
  "Experiments":      "ti-flask",
  "Action Tracking":  "ti-checkbox",
};

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e) => setError(e.message ?? "Unable to load dashboard"));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;
  if (!data) return <LoadingState label="Loading dashboard…" />;

  const tasks = data.tasks ?? [];
  const done = tasks.filter((t: any) => t.status === "DONE").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const latestGoal = data.goals?.[0];
  const selected = data.selectedFuture?.futureBranch;
  const roadmap = data.roadmaps?.[0];
  const insight = data.accountabilityInsights?.[0];
  const experiments = data.experiments ?? [];
  const streak = calcStreak(data.progressLogs ?? []);
  const name = localStorage.getItem("futureos_name") ?? "there";

  const steps = [
    { label: "AI Onboarding",    route: "/onboarding",       done: !!latestGoal },
    { label: "Assumptions",      route: "/assumptions",       done: (data.clarifications ?? []).some((c: any) => c.answer) },
    { label: "Future Simulation",route: "/futures",           done: (data.futureBranches ?? []).length > 0 },
    { label: "Preferences",      route: "/preferences",       done: !!data.preferences },
    { label: "Select Future",    route: "/future-selection",  done: !!selected },
    { label: "Gap Analysis",     route: "/gap-analysis",      done: (data.gapReports ?? []).length > 0 },
    { label: "Roadmap",          route: "/roadmap",           done: !!roadmap },
    { label: "Experiments",      route: "/experiments",       done: experiments.some((e: any) => e.status === "DONE") },
    { label: "Action Tracking",  route: "/progress",          done: done > 0 },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const workflowPct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Greeting */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#F1F5F9", marginBottom: 4 }}>
          Good morning, {name.split(" ")[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: "#64748B" }}>Here's your FutureOS overview for today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard icon="ti-git-branch" color="#6366F1" label="Future Branches" value={String(data.futureBranches?.length ?? 0)} />
        <StatCard icon="ti-checkbox" color="#10B981" label="Task Completion" value={`${pct}%`} sub={`${done}/${tasks.length} tasks`} />
        <StatCard icon="ti-flame" color="#F59E0B" label="Day Streak" value={String(streak)} sub="days active" />
        <StatCard icon="ti-flask" color="#22D3EE" label="Experiments" value={String(experiments.length)} sub={`${experiments.filter((e:any)=>e.status==="DONE").length} completed`} />
      </div>

      {/* Workflow progress */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>Workflow Progress</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{completedSteps} of {steps.length} steps complete</div>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 600, color: "#6366F1",
            background: "rgba(99,102,241,0.1)", border: "0.5px solid rgba(99,102,241,0.25)",
            borderRadius: 99, padding: "3px 12px",
          }}>{workflowPct}%</span>
        </div>
        <ProgressBar value={workflowPct} />
        <div style={{ display: "grid", gap: 6, marginTop: 16, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {steps.map((step) => (
            <Link key={step.route} to={step.route} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: step.done ? "rgba(16,185,129,0.08)" : "#253347",
                border: `0.5px solid ${step.done ? "rgba(16,185,129,0.3)" : "#334155"}`,
                borderRadius: 8, padding: "8px 10px",
                transition: "border-color 0.15s, transform 0.15s",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: step.done ? "#10B981" : "#334155",
                  fontSize: 10, color: "#fff",
                }}>
                  {step.done
                    ? <i className="ti ti-check" style={{ fontSize: 10 }} />
                    : <i className={`ti ${STEP_ICONS[step.label] ?? "ti-circle"}`} style={{ fontSize: 10 }} />
                  }
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: step.done ? "#10B981" : "#94A3B8" }}>{step.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Middle row: Goal + Selected Future */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <i className="ti ti-target" style={{ color: "#6366F1", fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>Current Goal</span>
          </div>
          {latestGoal ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "Goal", val: latestGoal.goal },
                { key: "Confusion", val: latestGoal.biggestConfusion },
                { key: "Success", val: latestGoal.successDefinition },
              ].map(({ key, val }) => val && (
                <div key={key} style={{ background: "#253347", border: "0.5px solid #334155", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Complete onboarding to start your journey."
              action={<Link to="/onboarding"><Button>Start Onboarding</Button></Link>} />
          )}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <i className="ti ti-git-branch" style={{ color: "#6366F1", fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>Selected Future</span>
          </div>
          {selected ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#F1F5F9", marginBottom: 4 }}>{selected.title}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span className="badge badge-indigo">Match {Math.round(selected.score ?? 0)}</span>
                <span className="badge badge-success">Confidence {Math.round(selected.confidenceScore ?? 0)}</span>
              </div>
              <ProgressBar value={selected.score ?? 0} />
              <p style={{ marginTop: 12, fontSize: 12, color: "#94A3B8", lineHeight: 1.6,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {selected.whyItFits}
              </p>
              <Link to="/future-selection" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, color: "#6366F1", textDecoration: "none" }}>
                Change future <i className="ti ti-arrow-right" style={{ fontSize: 12 }} />
              </Link>
            </div>
          ) : (
            <EmptyState title="Select a future to lock in your direction."
              action={<Link to="/future-selection"><Button>Select Future</Button></Link>} />
          )}
        </Card>
      </div>

      {/* Bottom row: Roadmap + AI Insight */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <i className="ti ti-map" style={{ color: "#6366F1", fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>Roadmap</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748B" }}>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
          {roadmap ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 500 }}>{roadmap.title}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>v{roadmap.version} · {roadmap.adaptationReason}</div>
              <Link to="/roadmap" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 12, color: "#6366F1", textDecoration: "none" }}>
                View roadmap <i className="ti ti-arrow-right" style={{ fontSize: 12 }} />
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <Link to="/roadmap"><Button size="sm" variant="secondary"><i className="ti ti-wand" /> Generate Roadmap</Button></Link>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="ai-dot" />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>AI Insight</span>
          </div>
          {insight ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Consistency</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: "#F1F5F9", fontFamily: "JetBrains Mono, monospace" }}>{Math.round(insight.consistencyScore ?? 0)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Completion</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: "#10B981", fontFamily: "JetBrains Mono, monospace" }}>{Math.round(insight.completionRate ?? 0)}%</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>{insight.weeklyInsight}</p>
              <div style={{ background: "rgba(99,102,241,0.1)", border: "0.5px solid rgba(99,102,241,0.25)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6366F1" }}>
                <i className="ti ti-arrow-right" /> {insight.recommendedNextAction}
              </div>
            </div>
          ) : (
            <EmptyState title="Submit a check-in to generate AI insights."
              action={<Link to="/accountability"><Button size="sm">Check In</Button></Link>} />
          )}
        </Card>
      </div>

      {/* CTA if not started */}
      {!latestGoal && (
        <div style={{
          background: "rgba(99,102,241,0.08)", border: "0.5px solid rgba(99,102,241,0.3)",
          borderRadius: 12, padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9", marginBottom: 4 }}>Ready to begin?</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>Complete AI Onboarding to generate your first future simulation.</div>
          </div>
          <Link to="/onboarding">
            <Button>Start Onboarding <i className="ti ti-arrow-right" /></Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, color, label, value, sub }: { icon: string; color: string; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${color}18`,
          border: `0.5px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`ti ${icon}`} style={{ color, fontSize: 16 }} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: "#F1F5F9", fontFamily: "JetBrains Mono, monospace", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748B" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

function calcStreak(logs: any[]): number {
  if (!logs.length) return 0;
  const days = new Set(logs.map((l: any) => {
    const d = new Date(l.createdAt ?? "");
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (days.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) streak++;
    else if (i > 0) break;
  }
  return streak;
}