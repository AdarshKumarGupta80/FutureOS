import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckSquare, Flame, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Input";
import { LoadingState, ProgressBar } from "../components/ui/State";
import { api } from "../lib/api";

// ---------- types ----------
interface MilestoneTask {
  id: number;
  title: string;
  description?: string;
}

interface TaskState {
  task: MilestoneTask;
  completed: boolean;
}

// ---------- component ----------
export function ActionTrackingPage() {
  const [searchParams] = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");
  const milestoneTitle = searchParams.get("milestoneTitle") ?? undefined;
  const navigate = useNavigate();

  // task tracking state
  const [taskStates, setTaskStates] = useState<TaskState[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  // existing dashboard data (progress logs / streak / etc.)
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");

  // ---------- load dashboard data ----------
  function loadDashboard() {
    api.dashboard().then((d) => {
      setData(d);

      const allTasks: any[] = d.tasks ?? [];
      const mid = milestoneId ? Number(milestoneId) : null;

      // STRICT ISOLATION: only show tasks for the exact milestone.
      // If no milestoneId is in the URL, show nothing — never mix tasks across milestones.
      const filtered: any[] = mid != null
        ? allTasks.filter((t: any) => t.milestoneId === mid)
        : [];

      const realTasks: MilestoneTask[] = filtered.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
      }));

      setTaskStates((prev) => {
        const existingById = new Map(prev.map((ts) => [ts.task.id, ts.completed]));
        return realTasks.map((task: any) => ({
          task,
          completed: existingById.has(task.id)
            ? existingById.get(task.id)!
            : task.status === "DONE",
        }));
      });
      setTasksLoaded(true);
    }).catch(() => {
      setData({});
      setTasksLoaded(true);
    });
  }
  useEffect(loadDashboard, [milestoneId]);

  // ---------- task toggle ----------
  async function toggleTask(id: number) {
    const current = taskStates.find((ts) => ts.task.id === id);
    if (!current) return;
    const newCompleted = !current.completed;
    // Optimistically update UI
    setTaskStates((prev) =>
      prev.map((ts) => (ts.task.id === id ? { ...ts, completed: newCompleted } : ts))
    );
    // Persist to backend
    try {
      await api.updateTask(id, newCompleted ? "DONE" : "TODO");
    } catch {
      // Revert on failure
      setTaskStates((prev) =>
        prev.map((ts) => (ts.task.id === id ? { ...ts, completed: !newCompleted } : ts))
      );
    }
  }

  // ---------- progress log ----------
  async function addLog() {
    if (!note.trim()) return;
    await api.createProgress({ note }).catch(() => {});
    setNote("");
    loadDashboard();
  }

  // ---------- derived counts ----------
  const totalTasks = taskStates.length;
  const completedTasks = taskStates.filter((ts) => ts.completed).length;
  const pct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const allDone = totalTasks > 0 && completedTasks === totalTasks;

  // ---------- submit milestone completion ----------
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    if (!allDone) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      if (milestoneId) {
        await api.advanceMilestone(Number(milestoneId));
      }
      navigate("/roadmap");
    } catch (e: any) {
      setSubmitError(e.message ?? "Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- streak / logs from dashboard ----------
  const streak = data ? calcStreak(data.progressLogs ?? []) : 0;
  const thisWeekLogs = data
    ? (data.progressLogs ?? []).filter((l: any) => {
        const d = new Date(l.createdAt ?? "");
        const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }).length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 11 · Action Tracking</div>
        <h1 className="mt-1 text-2xl font-bold">
          {milestoneTitle ?? "Action Tracking"}
        </h1>
        {milestoneTitle && (
          <p className="mt-0.5 text-xs font-medium text-primary/70">Milestone #{milestoneId}</p>
        )}
        <p className="mt-1 text-sm text-foreground/60">
          Complete all tasks for this milestone, then submit progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CheckSquare size={20} className="text-primary" />}
          label="Completion"
          value={`${pct}%`}
          sub={`${completedTasks}/${totalTasks} tasks`}
        />
        <StatCard
          icon={<Flame size={20} className="text-orange-500" />}
          label="Day Streak"
          value={String(streak)}
          sub="days in a row"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          label="This Week"
          value={String(thisWeekLogs)}
          sub="progress logs"
        />
      </div>

      {/* Progress bar */}
      <Card>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Milestone Task Completion</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <ProgressBar value={pct} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Tasks */}
        <div className="space-y-4">
          <h2 className="font-bold">Tasks</h2>

          <div className="space-y-2">
            {taskStates.length === 0 && (
              <div className="rounded border border-border p-4 text-sm text-foreground/60">
                No tasks found for this milestone. Try regenerating your roadmap to create linked tasks.
              </div>
            )}

            {taskStates.map(({ task, completed }) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition ${
                  completed
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                    : "border-border"
                }`}
              >
                {/* Checkbox */}
                <button
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                    completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={completed ? "Mark incomplete" : "Mark complete"}
                >
                  {completed && "✓"}
                </button>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold ${
                      completed ? "line-through text-foreground/50" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="mt-0.5 text-xs text-foreground/60 truncate">
                      {task.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit button — disabled unless ALL tasks are completed */}
          {submitError && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {submitError}
            </div>
          )}
          <Button
            className="w-full mt-2"
            disabled={!allDone || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? "Saving…"
              : allDone
              ? "Submit Progress ✓"
              : `Complete all tasks to submit (${completedTasks}/${totalTasks})`}
          </Button>
        </div>

        {/* Progress log */}
        <div className="space-y-4">
          <h2 className="font-bold">Progress Log</h2>
          <Card>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you complete or learn today?"
              className="min-h-[100px]"
            />
            <Button
              className="mt-3 w-full"
              onClick={addLog}
              disabled={!note.trim()}
            >
              Add Entry
            </Button>
          </Card>

          {data && (
            <div className="space-y-2">
              {(data.progressLogs ?? []).slice(0, 20).map((log: any) => (
                <div key={log.id} className="rounded border border-border p-3 text-sm">
                  <div className="text-foreground/70">{log.note}</div>
                  {log.createdAt && (
                    <div className="mt-1 text-xs text-foreground/60">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      {icon}
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium text-foreground/70">{label}</div>
      <div className="text-xs text-foreground/50">{sub}</div>
    </Card>
  );
}

function calcStreak(logs: any[]): number {
  if (!logs.length) return 0;
  const days = new Set(
    logs.map((l: any) => {
      const d = new Date(l.createdAt ?? "");
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
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