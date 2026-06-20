import { useEffect, useState } from "react";
import { CheckSquare, Flame, Plus, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { LoadingState, ProgressBar } from "../components/ui/State";
import { api, Task } from "../lib/api";

export function ActionTrackingPage() {
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  function load() { api.dashboard().then(setData); }
  useEffect(load, []);

  async function toggleTask(task: Task) {
    setUpdating(task.id);
    try {
      await api.updateTask(task.id, task.status === "DONE" ? "TODO" : "DONE");
      load();
    } finally {
      setUpdating(null);
    }
  }

  async function addTask() {
    if (!newTask.title.trim()) return;
    await api.createTask({ ...newTask, commitment: true });
    setNewTask({ title: "", description: "", dueDate: "" });
    setShowAdd(false);
    load();
  }

  async function addLog() {
    if (!note.trim()) return;
    await api.createProgress({ note });
    setNote("");
    load();
  }

  if (!data) return <LoadingState label="Loading action tracking…" />;

  const tasks: Task[] = data.tasks ?? [];
  const done = tasks.filter((t) => t.status === "DONE").length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const commitments = tasks.filter((t) => t.commitment);
  const commitDone = commitments.filter((t) => t.status === "DONE").length;
  const streak = calcStreak(data.progressLogs ?? []);
  const thisWeekLogs = (data.progressLogs ?? []).filter((l: any) => {
    const d = new Date(l.createdAt ?? "");
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 11 · Action Tracking</div>
        <h1 className="mt-1 text-2xl font-bold">Action Tracking</h1>
        <p className="mt-1 text-sm text-foreground/60">Track tasks, build streaks, and measure weekly progress.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<CheckSquare size={20} className="text-primary" />} label="Completion" value={`${pct}%`} sub={`${done}/${total} tasks`} />
        <StatCard icon={<Flame size={20} className="text-orange-500" />} label="Day Streak" value={String(streak)} sub="days in a row" />
        <StatCard icon={<TrendingUp size={20} className="text-emerald-500" />} label="This Week" value={String(thisWeekLogs)} sub="progress logs" />
        <StatCard icon={<CheckSquare size={20} className="text-blue-500" />} label="Commitments" value={`${commitDone}/${commitments.length}`} sub="fulfilled" />
      </div>

      {/* Progress bar */}
      <Card>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Overall Task Completion</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <ProgressBar value={pct} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Tasks & Commitments</h2>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus size={14} /> Add Task
            </Button>
          </div>

          {showAdd && (
            <Card>
              <div className="space-y-3">
                <Input placeholder="Task title *" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                <Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                <div className="flex gap-2">
                  <Button onClick={addTask} disabled={!newTask.title.trim()}>Save Task</Button>
                  <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {tasks.length === 0 && <div className="rounded border border-border p-4 text-sm text-foreground/60">No tasks yet. Generate a roadmap or add a task above.</div>}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition ${task.status === "DONE" ? "border-emerald-300 bg-emerald-50/50 opacity-80" : "border-border"}`}
              >
                <button
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                    task.status === "DONE" ? "border-emerald-500 bg-emerald-500 text-white" : "border-border hover:border-primary"
                  }`}
                  onClick={() => toggleTask(task)}
                  disabled={updating === task.id}
                >
                  {task.status === "DONE" && "✓"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${task.status === "DONE" ? "line-through text-foreground/50" : ""}`}>{task.title}</div>
                  {task.description && <div className="mt-0.5 text-xs text-foreground/60 truncate">{task.description}</div>}
                  <div className="mt-1 flex gap-2">
                    {task.commitment && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Commitment</span>}
                    {task.dueDate && <span className="text-[10px] text-foreground/50">Due {task.dueDate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <Button className="mt-3 w-full" onClick={addLog} disabled={!note.trim()}>
              Add Entry
            </Button>
          </Card>
          <div className="space-y-2">
            {(data.progressLogs ?? []).slice(0, 20).map((log: any) => (
              <div key={log.id} className="rounded border border-border p-3 text-sm">
                <div className="text-foreground/70">{log.note}</div>
                {log.createdAt && <div className="mt-1 text-xs text-foreground/40">{new Date(log.createdAt).toLocaleDateString()}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
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
