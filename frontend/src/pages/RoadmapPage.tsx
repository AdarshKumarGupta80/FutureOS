import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Zap, BookOpen, Layers, Trophy, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState, LoadingState, ProgressBar } from "../components/ui/State";
import { api } from "../lib/api";

export function RoadmapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function load() { api.dashboard().then(setData).catch((e) => setError(e.message)); }
  useEffect(load, []);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      await api.generateRoadmap();
      load();
    } catch (e: any) {
      setError(e.message ?? "Roadmap generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <LoadingState label="Loading roadmap…" />;

  const roadmap = data.roadmaps?.[0];
  const milestones: any[] = data.milestones ?? [];
  const tasks: any[] = data.tasks ?? [];
  const versions: any[] = data.roadmapVersions ?? [];
  const done = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const selected = data.selectedFuture?.futureBranch;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 9 · Roadmap</div>
          <h1 className="mt-1 text-2xl font-bold">Adaptive Roadmap</h1>
          <p className="mt-1 text-sm text-foreground/60">Visual timeline from where you are to where you're going — persisted across sessions.</p>
        </div>
        <Button onClick={generate} disabled={loading || !selected}>
          <Map size={16} />
          {loading ? "Generating…" : roadmap ? "Regenerate" : "Generate Roadmap"}
        </Button>
      </div>

      {error && <ErrorState message={error} onRetry={generate} />}

      {!selected && !roadmap && (
        <Card className="border-amber-400 bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">Select a future first</p>
          <Button size="sm" className="mt-3" onClick={() => navigate("/future-selection")}>Select Future →</Button>
        </Card>
      )}

      {roadmap && (
        <>
          {/* Header stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard icon={<Trophy size={20} className="text-primary" />} label="Progress" value={`${progress}%`} />
            <StatCard icon={<Layers size={20} className="text-blue-500" />} label="Milestones" value={String(milestones.length)} />
            <StatCard icon={<Zap size={20} className="text-amber-500" />} label="Tasks" value={String(tasks.length)} />
            <StatCard icon={<Clock size={20} className="text-purple-500" />} label="Version" value={`v${roadmap.version ?? 1}`} />
          </div>

          {/* Progress bar */}
          <Card>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">Overall Progress</span>
              <span className="text-foreground/60">{done} / {tasks.length} tasks done</span>
            </div>
            <ProgressBar value={progress} />
            <div className="mt-2 text-xs text-foreground/50">v{roadmap.version} · {roadmap.adaptationReason}</div>
          </Card>

          {/* Visual timeline */}
          <div>
            <h2 className="mb-4 font-bold">Milestone Timeline</h2>
            <VisualTimeline milestones={milestones} tasks={tasks} startTitle={selected?.title ?? "Start"} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly plan */}
            <Card>
              <h3 className="mb-3 font-bold flex items-center gap-2"><Zap size={16} className="text-primary" /> Weekly Objectives</h3>
              <WeeklyPlanList plan={roadmap.weeklyPlan} />
            </Card>

            {/* Monthly plan */}
            <Card>
              <h3 className="mb-3 font-bold flex items-center gap-2"><BookOpen size={16} className="text-blue-500" /> Monthly Timeline</h3>
              <p className="text-sm text-foreground/70 whitespace-pre-line">{roadmap.monthlyPlan}</p>
            </Card>

            {/* Outcomes */}
            <Card>
              <h3 className="mb-3 font-bold">Expected Outcomes</h3>
              <p className="text-sm text-foreground/70">{roadmap.expectedOutcomes}</p>
            </Card>

            {/* Version history */}
            <Card>
              <h3 className="mb-3 font-bold">Roadmap History</h3>
              <div className="space-y-2">
                {versions.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="flex items-start gap-3 rounded border border-border p-3 text-xs">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {v.version}
                    </div>
                    <div>
                      <div className="font-semibold">v{v.version}</div>
                      <div className="text-foreground/60">{v.reason}</div>
                    </div>
                  </div>
                ))}
                {!versions.length && <div className="text-xs text-foreground/50">Versions appear after generation.</div>}
              </div>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/experiments")}>Life Experiments →</Button>
            <Button variant="secondary" onClick={() => navigate("/progress")}>Track Actions →</Button>
          </div>
        </>
      )}

      {!roadmap && !error && selected && (
        <EmptyState title="No roadmap yet. Click Generate Roadmap above." />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      {icon}
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </Card>
  );
}

function VisualTimeline({ milestones, tasks, startTitle }: { milestones: any[]; tasks: any[]; startTitle: string }) {
  const items = [
    { id: "start", title: startTitle, type: "start", status: "DONE", targetDate: null },
    ...milestones.map((m) => ({ ...m, type: "milestone" })),
    { id: "outcome", title: "Your Future", type: "outcome", status: "PENDING", targetDate: null },
  ];

  const milestoneDone = milestones.filter((m) => m.status === "DONE").length;
  const totalSteps = milestones.length;
  const pct = totalSteps ? Math.round((milestoneDone / totalSteps) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item, idx) => {
          const isDone = item.status === "DONE" || item.type === "start";
          const isNext = !isDone && items.slice(0, idx).every((p) => p.status === "DONE" || p.type === "start");
          const mTasks = tasks.filter((t) => (item as any).id && t.roadmapMilestoneId === (item as any).id);

          return (
            <div key={item.id ?? idx} className="flex shrink-0 flex-col items-center gap-2" style={{ minWidth: 140 }}>
              {/* Connector line */}
              {idx > 0 && (
                <div className={`mt-6 h-px w-8 shrink-0 ${isDone ? "bg-primary" : "bg-border"}`} style={{ position: "absolute", left: -20 }} />
              )}

              <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-sm transition
                ${item.type === "start" ? "border-primary bg-primary text-white" :
                  item.type === "outcome" ? "border-emerald-400 bg-emerald-100 text-emerald-700" :
                  isDone ? "border-emerald-400 bg-emerald-500 text-white" :
                  isNext ? "border-primary bg-primary/10 text-primary" :
                  "border-border bg-muted text-foreground/50"
                }`}
              >
                {item.type === "start" ? "S" : item.type === "outcome" ? "🎯" : isDone ? "✓" : idx}
              </div>

              <div className="text-center">
                <div className="text-xs font-semibold">{item.title}</div>
                {item.targetDate && <div className="text-[10px] text-foreground/50">{item.targetDate}</div>}
                {isNext && <div className="mt-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Next</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone cards */}
      {milestones.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m, idx) => {
            const mPct = m.status === "DONE" ? 100 : m.status === "RUNNING" ? 50 : 10;
            const relatedTasks = tasks.filter((t) => t.description?.includes(m.title));
            return (
              <Card key={m.id}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${m.status === "DONE" ? "bg-emerald-500 text-white" : "bg-muted"}`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold uppercase text-foreground/50">{m.status ?? "Pending"}</span>
                </div>
                <div className="font-semibold">{m.title}</div>
                {m.targetDate && <div className="mt-1 text-xs text-foreground/50">Target: {m.targetDate}</div>}
                <div className="mt-3">
                  <ProgressBar value={mPct} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WeeklyPlanList({ plan }: { plan: string }) {
  const items = (plan ?? "").split(/\n|(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 rounded border border-border p-2 text-sm">
          <span className="shrink-0 text-primary font-bold">{i + 1}.</span>
          <span className="text-foreground/70">{item}</span>
        </div>
      ))}
    </div>
  );
}
