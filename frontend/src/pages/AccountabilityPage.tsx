import { useEffect, useState } from "react";
import { ShieldCheck, Brain, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Input";
import { LoadingState, ProgressBar } from "../components/ui/State";
import { api, AccountabilityInsight } from "../lib/api";

export function AccountabilityPage() {
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  function load() { api.dashboard().then(setData); }
  useEffect(load, []);

  async function submit() {
    if (!note.trim()) return;
    setLoading(true);
    try {
      const r = await api.accountability(note);
      setResponse(r.message ?? "");
      setNote("");
      load();
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <LoadingState label="Loading accountability loop…" />;

  const insight: AccountabilityInsight | null = data.accountabilityInsights?.[0] ?? null;
  const tasks = data.tasks ?? [];
  const done = tasks.filter((t: any) => t.status === "DONE").length;
  const missed = tasks.filter((t: any) => t.commitment && t.status !== "DONE").length;

  // Detect inactivity
  const lastLog = data.progressLogs?.[0];
  const daysSinceLog = lastLog?.createdAt
    ? Math.floor((Date.now() - new Date(lastLog.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const inactive = daysSinceLog !== null && daysSinceLog >= 3;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 12 · AI Accountability Loop</div>
        <h1 className="mt-1 text-2xl font-bold">AI Accountability Loop</h1>
        <p className="mt-1 text-sm text-foreground/60">AI reviews your progress, detects inactivity, and generates weekly feedback.</p>
      </div>

      {inactive && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="text-amber-400 shrink-0" size={18} />
            <div>
              <p className="text-sm font-semibold text-amber-300">Inactivity detected — {daysSinceLog} days since last log</p>
              <p className="mt-1 text-xs text-amber-200/80">Submit an accountability check-in to get back on track.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Check-in form */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-1 font-bold flex items-center gap-2">
              <Brain size={18} className="text-primary" /> Weekly Check-In
            </h2>
            <p className="mb-4 text-sm text-foreground/60">
              Report what happened, blockers you faced, and what needs to change. AI will review and adapt your roadmap.
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I completed 3 tasks but missed 2 due to work pressure. I need to reduce scope this week..."
              className="min-h-[120px]"
            />
            <Button className="mt-3" onClick={submit} disabled={loading || !note.trim()}>
              <ShieldCheck size={16} />
              {loading ? "Processing…" : "Submit Check-In"}
            </Button>

            {response && (
              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <div className="font-semibold text-primary mb-1">AI Response</div>
                {response}
              </div>
            )}
          </Card>

          {/* Quick stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Tasks Done" value={done} color="emerald" />
            <MiniStat label="Missed Commits" value={missed} color="red" />
            <MiniStat label="Total Tasks" value={tasks.length} color="blue" />
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-bold">AI Insights</h2>
            {insight ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground/60">Completion Rate</span>
                    <span className="font-bold">{Math.round(insight.completionRate ?? 0)}%</span>
                  </div>
                  <ProgressBar value={insight.completionRate ?? 0} />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground/60">Consistency Score</span>
                    <span className="font-bold">{Math.round(insight.consistencyScore ?? 0)}</span>
                  </div>
                  <ProgressBar value={insight.consistencyScore ?? 0} />
                </div>
                <InsightBlock title="Weekly Insight" value={insight.weeklyInsight} />
                <InsightBlock title="Common Blockers" value={insight.commonBlockers} />
                <InsightBlock title="Suggested Adjustments" value={insight.suggestedAdjustments} />
                <div className="rounded-lg bg-primary/10 p-3">
                  <div className="text-xs font-semibold text-primary mb-1">Recommended Next Action</div>
                  <p className="text-sm">{insight.recommendedNextAction}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/60">Submit a check-in to generate AI insights.</p>
            )}
          </Card>

          {/* Insight history */}
          {(data.accountabilityInsights ?? []).length > 1 && (
            <Card>
              <h3 className="mb-3 font-bold text-sm">Past Insights</h3>
              <div className="space-y-2">
                {(data.accountabilityInsights as AccountabilityInsight[]).slice(1, 5).map((ins) => (
                  <div key={ins.id} className="rounded border border-border p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">Completion: {Math.round(ins.completionRate)}%</span>
                      <span className="text-foreground/50">Missed: {ins.missedCommitments}</span>
                    </div>
                    <p className="text-foreground/60 line-clamp-2">{ins.weeklyInsight}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/30",
    red: "bg-red-500/10 border-red-500/30",
    blue: "bg-blue-500/10 border-blue-500/30",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color] ?? ""}`}>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </div>
  );
}

function InsightBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-foreground/60 mb-1">{title}</div>
      <p className="text-sm text-foreground/80">{value || "—"}</p>
    </div>
  );
}