import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BookOpen, CheckSquare, Flame, GitBranch, Map, Sparkles, Target, TestTube, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState, ProgressBar } from "../components/ui/State";
import { api } from "../lib/api";

type Step = { label: string; route: string; done: boolean; icon: React.ComponentType<any> };

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

  // Workflow steps
  const steps: Step[] = [
    { label: "AI Onboarding", route: "/onboarding", done: !!latestGoal, icon: Target },
    { label: "Assumptions", route: "/assumptions", done: (data.clarifications ?? []).some((c: any) => c.answer), icon: BookOpen },
    { label: "Future Simulation", route: "/futures", done: (data.futureBranches ?? []).length > 0, icon: Sparkles },
    { label: "Preferences", route: "/preferences", done: !!data.preferences, icon: Activity },
    { label: "Select Future", route: "/future-selection", done: !!selected, icon: GitBranch },
    { label: "Gap Analysis", route: "/gap-analysis", done: (data.gapReports ?? []).length > 0, icon: TrendingUp },
    { label: "Roadmap", route: "/roadmap", done: !!roadmap, icon: Map },
    { label: "Experiments", route: "/experiments", done: experiments.some((e: any) => e.status === "DONE"), icon: TestTube },
    { label: "Action Tracking", route: "/progress", done: done > 0, icon: CheckSquare },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const workflowPct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Sparkles size={20} className="text-primary" />} label="Future Branches" value={String(data.futureBranches?.length ?? 0)} />
        <StatCard icon={<CheckSquare size={20} className="text-emerald-500" />} label="Task Completion" value={`${pct}%`} sub={`${done}/${tasks.length}`} />
        <StatCard icon={<Flame size={20} className="text-orange-500" />} label="Day Streak" value={String(streak)} sub="days" />
        <StatCard icon={<TestTube size={20} className="text-blue-500" />} label="Experiments" value={String(experiments.length)} sub={`${experiments.filter((e: any) => e.status === "DONE").length} done`} />
      </div>

      {/* Workflow progress */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Workflow Progress</h2>
          <span className="text-sm font-semibold text-primary">{completedSteps}/{steps.length} steps</span>
        </div>
        <ProgressBar value={workflowPct} />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {steps.map((step) => (
            <Link key={step.route} to={step.route}>
              <div className={`flex items-center gap-2 rounded border p-2 text-xs transition hover:border-primary/50 ${step.done ? "border-emerald-300 bg-emerald-50" : "border-border"}`}>
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${step.done ? "bg-emerald-500 text-white" : "bg-muted text-foreground/50"}`}>
                  {step.done ? "✓" : <step.icon size={10} />}
                </div>
                <span className={step.done ? "text-emerald-700 font-medium" : "text-foreground/70"}>{step.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Goal & Selected Future */}
        <Card>
          <h2 className="mb-4 font-bold">Current Goal</h2>
          {latestGoal ? (
            <div className="space-y-3 text-sm">
              <div className="rounded bg-muted p-3"><span className="font-semibold">Goal: </span>{latestGoal.goal}</div>
              <div className="rounded bg-muted p-3"><span className="font-semibold">Confusion: </span>{latestGoal.biggestConfusion}</div>
              <div className="rounded bg-muted p-3"><span className="font-semibold">Success means: </span>{latestGoal.successDefinition}</div>
            </div>
          ) : (
            <EmptyState
              title="Complete onboarding to start your journey."
              action={<Link to="/onboarding"><Button>Start Onboarding</Button></Link>}
            />
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">Selected Future</h2>
          {selected ? (
            <div>
              <div className="text-xl font-bold">{selected.title}</div>
              <div className="mt-1 text-xs text-foreground/60">Match {Math.round(selected.score ?? 0)} · Confidence {Math.round(selected.confidenceScore ?? 0)}</div>
              <div className="mt-3">
                <ProgressBar value={selected.score ?? 0} />
              </div>
              <p className="mt-3 text-sm text-foreground/70 line-clamp-3">{selected.whyItFits}</p>
              <Link to="/future-selection" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Change <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <EmptyState
              title="Select a future to lock in your direction."
              action={<Link to="/future-selection"><Button>Select Future</Button></Link>}
            />
          )}
        </Card>
      </div>

      {/* Roadmap + AI Insight */}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Roadmap Progress</h2>
            <span className="text-sm text-foreground/60">{pct}%</span>
          </div>
          <ProgressBar value={pct} />
          {roadmap ? (
            <div className="mt-4 space-y-2 text-sm">
              <div><span className="font-semibold">Roadmap: </span>{roadmap.title}</div>
              <div className="text-foreground/60">v{roadmap.version} · {roadmap.adaptationReason}</div>
              <Link to="/roadmap" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View roadmap <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="mt-4 text-sm text-foreground/60">
              <Link to="/roadmap"><Button size="sm">Generate Roadmap</Button></Link>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">AI Insight</h2>
          {insight ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-xs text-foreground/60">Consistency</div>
                  <div className="text-3xl font-bold">{Math.round(insight.consistencyScore ?? 0)}</div>
                </div>
                <div className="text-right text-xs text-foreground/60">{Math.round(insight.completionRate ?? 0)}% completion</div>
              </div>
              <p className="text-foreground/70">{insight.weeklyInsight}</p>
              <div className="rounded bg-primary/10 p-3 text-xs font-medium text-primary">{insight.recommendedNextAction}</div>
            </div>
          ) : (
            <EmptyState
              title="Submit a check-in to generate AI insights."
              action={<Link to="/accountability"><Button size="sm">Check In</Button></Link>}
            />
          )}
        </Card>
      </div>

      {/* Next step prompt */}
      {!latestGoal && (
        <Card className="border-primary bg-primary/5">
          <h2 className="font-bold">Get Started</h2>
          <p className="mt-1 text-sm text-foreground/70">Complete AI Onboarding to generate your first future simulation.</p>
          <Link to="/onboarding"><Button className="mt-4">Start Onboarding →</Button></Link>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      {icon}
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="text-sm text-foreground/60">{label}</div>
      {sub && <div className="text-xs text-foreground/40">{sub}</div>}
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
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}
