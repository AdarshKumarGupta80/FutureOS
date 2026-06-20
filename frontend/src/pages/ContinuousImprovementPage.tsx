import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, RefreshCw, GitBranch, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingState, ProgressBar } from "../components/ui/State";
import { api } from "../lib/api";

export function ContinuousImprovementPage() {
  const [data, setData] = useState<any>(null);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();

  function load() { api.dashboard().then(setData); }
  useEffect(load, []);

  async function regenerateFutures() {
    setRegenerating(true);
    try {
      const result = await api.regenerateFutures();
      setData(result);
    } finally {
      setRegenerating(false);
    }
  }

  if (!data) return <LoadingState label="Loading improvement data…" />;

  const insights = data.accountabilityInsights ?? [];
  const latestInsight = insights[0];
  const tasks = data.tasks ?? [];
  const done = tasks.filter((t: any) => t.status === "DONE").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const versions = data.roadmapVersions ?? [];
  const experiments = data.experiments ?? [];
  const completedExp = experiments.filter((e: any) => e.status === "DONE").length;
  const logs = data.progressLogs ?? [];

  // Trend: compare last 2 insights
  const prevInsight = insights[1];
  const trend = latestInsight && prevInsight
    ? latestInsight.completionRate - prevInsight.completionRate
    : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 13 · Continuous Improvement</div>
        <h1 className="mt-1 text-2xl font-bold">Continuous Improvement</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Uses all previous workflow results to continuously refine your roadmap and recommendations.
        </p>
      </div>

      {/* Overall health score */}
      <Card>
        <h2 className="mb-4 font-bold">System Health</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Health label="Task Completion" value={pct} />
          <Health label="Consistency" value={Math.round(latestInsight?.consistencyScore ?? 0)} />
          <Health label="Experiments Done" value={experiments.length ? Math.round((completedExp / experiments.length) * 100) : 0} />
          <Health label="Progress Logs" value={Math.min(100, logs.length * 5)} />
        </div>
      </Card>

      {/* Improvement trend */}
      {trend !== null && (
        <Card className={trend >= 0 ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}>
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className={trend >= 0 ? "text-emerald-400" : "text-red-400"} />
            <div>
              <div className="font-bold text-foreground">{trend >= 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`} completion rate change</div>
              <div className="text-sm text-foreground/60">vs. previous accountability check-in</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Roadmap evolution */}
        <Card>
          <h3 className="mb-3 font-bold flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" /> Roadmap Evolution
          </h3>
          {versions.length ? (
            <div className="space-y-2">
              {versions.slice(0, 6).map((v: any, i: number) => (
                <div key={v.id} className="flex gap-3 text-xs">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {v.version}
                  </div>
                  <div>
                    <div className="font-semibold">v{v.version}</div>
                    <div className="text-foreground/60">{v.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">No roadmap versions yet.</p>
          )}
        </Card>

        {/* AI insight history */}
        <Card>
          <h3 className="mb-3 font-bold flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Accountability History
          </h3>
          {insights.length ? (
            <div className="space-y-3">
              {insights.slice(0, 5).map((ins: any) => (
                <div key={ins.id} className="rounded border border-border p-3 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Completion {Math.round(ins.completionRate)}%</span>
                    <span className="font-semibold">Consistency {Math.round(ins.consistencyScore)}</span>
                  </div>
                  <ProgressBar value={ins.completionRate} />
                  <p className="mt-2 text-foreground/60 line-clamp-2">{ins.weeklyInsight}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">No accountability insights yet.</p>
          )}
        </Card>

        {/* Re-simulation */}
        <Card>
          <h3 className="mb-2 font-bold flex items-center gap-2">
            <GitBranch size={16} className="text-primary" /> Refine Future Simulation
          </h3>
          <p className="mb-4 text-sm text-foreground/60">
            Using all your clarification answers, preference settings, and accountability feedback, regenerate your future branches for updated recommendations.
          </p>
          <div className="space-y-2 text-xs text-foreground/50 mb-4">
            <div>✓ {(data.clarifications ?? []).filter((c: any) => c.answer).length} assumptions answered</div>
            <div>✓ Preferences: growth {data.preferences?.careerGrowth ?? "—"}/10, autonomy {data.preferences?.autonomy ?? "—"}/10</div>
            <div>✓ {logs.length} progress logs</div>
            <div>✓ {insights.length} accountability check-ins</div>
          </div>
          <Button onClick={regenerateFutures} disabled={regenerating}>
            <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Regenerating…" : "Regenerate Futures"}
          </Button>
        </Card>

        {/* Recommended next actions */}
        {latestInsight && (
          <Card>
            <h3 className="mb-3 font-bold">Recommended Next Actions</h3>
            <div className="space-y-3">
              <ActionItem
                label="Next Action"
                value={latestInsight.recommendedNextAction}
                action={<Button size="sm" onClick={() => navigate("/progress")}>Track →</Button>}
              />
              <ActionItem label="Adjust Roadmap" value={latestInsight.suggestedAdjustments} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Health({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-emerald-600" : value >= 40 ? "text-amber-500" : "text-red-500";
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>{value}%</div>
      <div className="text-xs text-foreground/60">{label}</div>
      <div className="mt-1">
        <ProgressBar value={value} />
      </div>
    </div>
  );
}

function ActionItem({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="rounded border border-border p-3">
      <div className="mb-1 text-xs font-semibold text-foreground/60">{label}</div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-foreground/80">{value || "—"}</p>
        {action}
      </div>
    </div>
  );
}