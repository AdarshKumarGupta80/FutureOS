import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TestTube, Play, CheckCircle2, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, LoadingState } from "../components/ui/State";
import { api, Experiment } from "../lib/api";

export function LifeExperimentPage() {
  const [data, setData] = useState<any>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const navigate = useNavigate();

  function load() { api.dashboard().then(setData); }
  useEffect(load, []);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      await api.updateExperiment(id, status);
      load();
    } finally {
      setUpdating(null);
    }
  }

  if (!data) return <LoadingState label="Loading experiments…" />;

  const experiments: Experiment[] = data.experiments ?? [];
  const running = experiments.filter((e) => e.status === "RUNNING");
  const done = experiments.filter((e) => e.status === "DONE");
  const pending = experiments.filter((e) => !e.status || e.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 10 · Life Experiments</div>
        <h1 className="mt-1 text-2xl font-bold">Life Experiments</h1>
        <p className="mt-1 text-sm text-foreground/60">AI-generated real-world experiments to validate your career direction before committing.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Clock size={18} className="text-amber-500" />} label="Pending" count={pending.length} color="amber" />
        <StatCard icon={<Play size={18} className="text-blue-500" />} label="Running" count={running.length} color="blue" />
        <StatCard icon={<CheckCircle2 size={18} className="text-emerald-500" />} label="Completed" count={done.length} color="emerald" />
      </div>

      {!experiments.length ? (
        <Card>
          <TestTube className="mb-3 text-primary" size={28} />
          <h2 className="font-bold">No experiments yet</h2>
          <p className="mt-2 text-sm text-foreground/60">Generate a roadmap to receive AI-suggested experiments. Examples include:</p>
          <ul className="mt-3 space-y-1 text-sm text-foreground/60 list-disc list-inside">
            <li>Build a mini AI project in 30 days</li>
            <li>Talk to 3 professionals in your target field</li>
            <li>Complete one freelance task this week</li>
            <li>Make an open-source contribution</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => navigate("/roadmap")}>Generate Roadmap →</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {running.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-blue-600">🔬 Currently Running</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {running.map((e) => <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} />)}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-foreground/80">📋 Pending Experiments</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((e) => <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} />)}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-emerald-600">✅ Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {done.map((e) => <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50",
    blue: "border-blue-200 bg-blue-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };
  return (
    <div className={`flex items-center gap-4 rounded-lg border p-4 ${colors[color] ?? ""}`}>
      {icon}
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-xs text-foreground/60">{label}</div>
      </div>
    </div>
  );
}

function ExperimentCard({ exp, updating, onUpdate }: {
  exp: Experiment;
  updating: number | null;
  onUpdate: (id: number, status: string) => void;
}) {
  return (
    <Card className={exp.status === "DONE" ? "border-emerald-300 bg-emerald-50/50" : exp.status === "RUNNING" ? "border-blue-300 bg-blue-50/50" : ""}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className={`mb-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase
            ${exp.status === "DONE" ? "bg-emerald-500 text-white" :
              exp.status === "RUNNING" ? "bg-blue-500 text-white" :
              "bg-muted text-foreground/60"
            }`}>
            {exp.status ?? "Pending"}
          </div>
          <h3 className="font-semibold">{exp.title}</h3>
        </div>
        <div className="shrink-0 text-right text-xs text-foreground/60">
          <div className="font-semibold">{exp.durationDays}d</div>
        </div>
      </div>

      <p className="text-sm text-foreground/70">{exp.hypothesis}</p>

      <div className="mt-3 rounded bg-muted px-3 py-2">
        <div className="text-xs font-semibold text-foreground/60">Success metric</div>
        <div className="mt-0.5 text-xs text-foreground/80">{exp.successMetric}</div>
      </div>

      {exp.status !== "DONE" && (
        <div className="mt-4 flex gap-2">
          {exp.status !== "RUNNING" && (
            <Button
              size="sm"
              disabled={updating === exp.id}
              onClick={() => onUpdate(exp.id, "RUNNING")}
            >
              <Play size={13} /> Start
            </Button>
          )}
          <Button
            size="sm"
            variant="success"
            disabled={updating === exp.id}
            onClick={() => onUpdate(exp.id, "DONE")}
          >
            <CheckCircle2 size={13} /> Mark Done
          </Button>
        </div>
      )}
    </Card>
  );
}
