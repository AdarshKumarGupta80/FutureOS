import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TestTube, Play, CheckCircle2, Clock, Sparkles, Send, Trophy } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingState } from "../components/ui/State";
import {
  api,
  Experiment,
  ExperimentDayPlanEntry,
  ExperimentVerdict,
} from "../lib/api";

export function LifeExperimentPage() {
  const [data, setData] = useState<any>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  function load() {
    api.dashboard().then(setData);
  }
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

  async function handleGenerate(pathA: string, pathB: string, durationDays: number) {
    setGenerating(true);
    try {
      await api.generateExperiment(pathA, pathB, durationDays);
      load();
    } finally {
      setGenerating(false);
    }
  }

  if (!data) return <LoadingState label="Loading experiments…" />;

  const experiments: Experiment[] = data.experiments ?? [];
  const running = experiments.filter((e) => e.status === "RUNNING");
  const done = experiments.filter((e) => e.status === "DONE");
  const pending = experiments.filter((e) => !e.status || e.status === "PLANNED" || e.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 10 · Life Experiments</div>
        <h1 className="mt-1 text-2xl font-bold">Life Experiments</h1>
        <p className="mt-1 text-sm text-foreground/60">
          AI-generated real-world experiments to validate your career direction before committing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Clock size={18} className="text-amber-500" />} label="Pending" count={pending.length} color="amber" />
        <StatCard icon={<Play size={18} className="text-blue-500" />} label="Running" count={running.length} color="blue" />
        <StatCard icon={<CheckCircle2 size={18} className="text-emerald-500" />} label="Completed" count={done.length} color="emerald" />
      </div>

      {/* Generator: compare two paths */}
      <GeneratorCard onGenerate={handleGenerate} generating={generating} />

      {!experiments.length ? (
        <Card>
          <TestTube className="mb-3 text-primary" size={28} />
          <h2 className="font-bold">No experiments yet</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Use the generator above to compare two paths (e.g. "AI Engineer" vs "Product Manager"), or generate a
            roadmap to receive AI-suggested experiments. Examples include:
          </p>
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
                {running.map((e) => (
                  <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} onChange={load} />
                ))}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-foreground/80">📋 Pending Experiments</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((e) => (
                  <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} onChange={load} />
                ))}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-emerald-600">✅ Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {done.map((e) => (
                  <ExperimentCard key={e.id} exp={e} updating={updating} onUpdate={updateStatus} onChange={load} />
                ))}
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
    amber: "border-amber-500/30 bg-amber-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    emerald: "border-emerald-500/30 bg-emerald-500/10",
  };
  return (
    <div className={`flex items-center gap-4 rounded-lg border p-4 ${colors[color] ?? ""}`}>
      {icon}
      <div>
        <div className="text-2xl font-bold text-foreground">{count}</div>
        <div className="text-xs text-foreground/60">{label}</div>
      </div>
    </div>
  );
}

function GeneratorCard({
  onGenerate,
  generating,
}: {
  onGenerate: (pathA: string, pathB: string, durationDays: number) => Promise<void>;
  generating: boolean;
}) {
  const [pathA, setPathA] = useState("");
  const [pathB, setPathB] = useState("");
  const [durationDays, setDurationDays] = useState(7);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <h2 className="font-bold">Compare two paths</h2>
      </div>
      <p className="mb-4 text-sm text-foreground/60">
        Confused between two directions? Generate a side-by-side daily experiment to find out which one actually
        feels right.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
        <input
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Path A (e.g. AI Engineer)"
          value={pathA}
          onChange={(e) => setPathA(e.target.value)}
        />
        <div className="flex items-center justify-center text-sm font-semibold text-foreground/50">vs</div>
        <input
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Path B (e.g. Product Manager)"
          value={pathB}
          onChange={(e) => setPathB(e.target.value)}
        />
        <input
          type="number"
          min={1}
          max={30}
          className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value) || 7)}
        />
      </div>
      <div className="mt-4">
        <Button
          disabled={!pathA.trim() || !pathB.trim() || generating}
          onClick={() => onGenerate(pathA.trim(), pathB.trim(), durationDays)}
        >
          <Sparkles size={14} /> {generating ? "Generating…" : `Generate ${durationDays}-Day Experiment`}
        </Button>
      </div>
    </Card>
  );
}

function ExperimentCard({
  exp,
  updating,
  onUpdate,
  onChange,
}: {
  exp: Experiment;
  updating: number | null;
  onUpdate: (id: number, status: string) => void;
  onChange: () => void;
}) {
  const isComparison = !!(exp.pathA && exp.pathB);

  return (
    <Card
      className={
        exp.status === "DONE"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : exp.status === "RUNNING"
          ? "border-blue-500/30 bg-blue-500/5"
          : ""
      }
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div
            className={`mb-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase
            ${
              exp.status === "DONE"
                ? "bg-emerald-500 text-white"
                : exp.status === "RUNNING"
                ? "bg-blue-500 text-white"
                : "bg-muted text-foreground/60"
            }`}
          >
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

      {isComparison && exp.dayPlanJson && <DayPlan exp={exp} />}

      {isComparison && exp.status === "RUNNING" && <CheckinForm exp={exp} onChange={onChange} />}

      {isComparison && exp.verdictJson && (
        <VerdictPanel verdictJson={exp.verdictJson} pathA={exp.pathA!} pathB={exp.pathB!} />
      )}

      {exp.status !== "DONE" && (
        <div className="mt-4 flex gap-2">
          {exp.status !== "RUNNING" && (
            <Button size="sm" disabled={updating === exp.id} onClick={() => onUpdate(exp.id, "RUNNING")}>
              <Play size={13} /> Start
            </Button>
          )}
          {isComparison ? (
            <Button
              size="sm"
              variant="success"
              disabled={updating === exp.id}
              onClick={async () => {
                await api.getExperimentVerdict(exp.id);
                onChange();
              }}
            >
              <Trophy size={13} /> Get Verdict
            </Button>
          ) : (
            <Button size="sm" variant="success" disabled={updating === exp.id} onClick={() => onUpdate(exp.id, "DONE")}>
              <CheckCircle2 size={13} /> Mark Done
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function DayPlan({ exp }: { exp: Experiment }) {
  let plan: ExperimentDayPlanEntry[] = [];
  try {
    plan = JSON.parse(exp.dayPlanJson ?? "[]");
  } catch {
    plan = [];
  }
  if (!plan.length) return null;

  return (
    <div className="mt-3 rounded border border-border overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 bg-muted/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
        <div>Day</div>
        <div>{exp.pathA}</div>
        <div>{exp.pathB}</div>
      </div>
      {/* Day rows */}
      <div className="divide-y divide-border">
        {plan.map((d) => (
          <div key={d.day} className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 px-3 py-2.5 text-xs">
            <div className="flex items-center font-bold text-primary">D{d.day}</div>
            <div className="text-foreground/70">{d.pathA?.description}</div>
            <div className="text-foreground/70">{d.pathB?.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckinForm({ exp, onChange }: { exp: Experiment; onChange: () => void }) {
  const [day, setDay] = useState(1);
  const [path, setPath] = useState<"A" | "B">("A");
  const [interest, setInterest] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [enjoyment, setEnjoyment] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await api.recordExperimentCheckin(exp.id, { day, path, interest, difficulty, enjoyment, notes });
      setNotes("");
      onChange();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded border border-border p-3">
      <div className="mb-2 text-xs font-semibold text-foreground/70">Log today's check-in</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="text-xs">
          Day
          <input
            type="number"
            min={1}
            max={exp.durationDays}
            value={day}
            onChange={(e) => setDay(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1"
          />
        </label>
        <label className="text-xs">
          Path
          <select
            value={path}
            onChange={(e) => setPath(e.target.value as "A" | "B")}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1"
          >
            <option value="A">{exp.pathA}</option>
            <option value="B">{exp.pathB}</option>
          </select>
        </label>
        <RatingField label="Interest" value={interest} onChange={setInterest} />
        <RatingField label="Difficulty" value={difficulty} onChange={setDifficulty} />
        <RatingField label="Enjoyment" value={enjoyment} onChange={setEnjoyment} />
      </div>
      <input
        className="mt-2 w-full rounded border border-border bg-background px-2 py-1 text-xs"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button size="sm" className="mt-2" disabled={saving} onClick={submit}>
        <Send size={12} /> {saving ? "Saving…" : "Save Check-in"}
      </Button>
    </div>
  );
}

function RatingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-xs">
      {label} ({value})
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}

function VerdictPanel({ verdictJson, pathA, pathB }: { verdictJson: string; pathA: string; pathB: string }) {
  let verdict: ExperimentVerdict | null = null;
  try {
    verdict = JSON.parse(verdictJson);
  } catch {
    verdict = null;
  }
  if (!verdict) return null;

  return (
    <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/10 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
        <Trophy size={14} /> Verdict
      </div>
      <div className="text-sm font-semibold text-foreground">{verdict.recommendedPath} feels more aligned</div>
      {verdict.reasoning && <p className="mt-1 text-xs text-foreground/70">{verdict.reasoning}</p>}
      {verdict.pathAScores && verdict.pathBScores && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <ScoreBlock label={pathA} scores={verdict.pathAScores} />
          <ScoreBlock label={pathB} scores={verdict.pathBScores} />
        </div>
      )}
    </div>
  );
}

function ScoreBlock({
  label,
  scores,
}: {
  label: string;
  scores: { interest: number; difficulty: number; enjoyment: number };
}) {
  return (
    <div className="rounded bg-foreground/10 p-2 text-foreground/90">
      <div className="font-semibold text-foreground">{label}</div>
      <div>Interest: {scores.interest.toFixed(1)}</div>
      <div>Difficulty: {scores.difficulty.toFixed(1)}</div>
      <div>Enjoyment: {scores.enjoyment.toFixed(1)}</div>
    </div>
  );
}