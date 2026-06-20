import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, LoadingState } from "../components/ui/State";
import { api } from "../lib/api";

export function AssumptionValidationPage() {
  const [data, setData] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO">>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    const d = await api.dashboard();
    setData(d);
    // Restore existing answers from backend
    const existing: Record<number, "YES" | "NO"> = {};
    (d.clarifications ?? []).forEach((c: any) => {
      if (c.answer === "YES" || c.answer === "NO") {
        existing[c.id] = c.answer;
      }
    });
    setAnswers(existing);
  }

  useEffect(() => { load(); }, []);

  if (!data) return <LoadingState label="Loading assumptions…" />;

  const clarifications = data.clarifications ?? [];

  if (!clarifications.length) {
    return (
      <div className="space-y-5">
        <PageHeader />
        <EmptyState
          title="No assumptions to validate yet. Complete AI Onboarding first to generate assumption cards."
          action={<Button onClick={() => navigate("/onboarding")}>Go to Onboarding</Button>}
        />
      </div>
    );
  }

  const card = clarifications[current];
  const answered = Object.keys(answers).length;
  const total = clarifications.length;
  const progress = Math.round((answered / total) * 100);
  const allDone = answered === total;

  async function answer(val: "YES" | "NO") {
    if (saving) return;           // guard against double-click
    setSaving(true);
    setError("");
    try {
      await api.clarify(card.id, val);
      // Update local state immediately — don't wait for a full dashboard reload
      setAnswers((prev) => ({ ...prev, [card.id]: val }));
      // Auto-advance to next unanswered card
      if (current < clarifications.length - 1) {
        setTimeout(() => setCurrent((c) => c + 1), 250);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);          // always reset — fixes frozen-button bug
    }
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <PageHeader />

      {/* Progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-foreground/60">
          <span>{answered} of {total} answered</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Navigator */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <span className="text-xs text-foreground/50">{current + 1} / {total}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={current === total - 1}
          onClick={() => setCurrent((c) => c + 1)}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Card */}
      <Card className={`transition-all ${answers[card.id] ? "border-primary/40 bg-primary/5" : ""}`}>
        {card.assumption && (
          <div className="mb-3 rounded bg-muted px-2.5 py-1.5 text-xs text-foreground/60">
            <span className="font-semibold">Assumption:</span> {card.assumption}
          </div>
        )}

        <p className="text-base font-semibold leading-snug">{card.question}</p>

        {card.confidenceImpact > 0 && (
          <p className="mt-1.5 text-xs text-foreground/40">
            Confidence impact: {Math.round(card.confidenceImpact)} pts
          </p>
        )}

        {/* YES / NO buttons — smaller, clearly interactive */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => answer("YES")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition-all
              active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50
              ${answers[card.id] === "YES"
                ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                : "border-border bg-background text-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
          >
            <CheckCircle2 size={18} />
            YES
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => answer("NO")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition-all
              active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50
              ${answers[card.id] === "NO"
                ? "border-red-500 bg-red-500 text-white shadow-md"
                : "border-border bg-background text-foreground hover:border-red-400 hover:bg-red-50 hover:text-red-600"
              }`}
          >
            <XCircle size={18} />
            NO
          </button>
        </div>

        {/* Saving indicator */}
        {saving && (
          <p className="mt-2 text-center text-xs text-foreground/40">Saving…</p>
        )}
      </Card>

      {/* Dot navigation */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {clarifications.map((c: any, idx: number) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCurrent(idx)}
            title={`Card ${idx + 1}${answers[c.id] ? ` — ${answers[c.id]}` : ""}`}
            className={`h-2.5 w-2.5 rounded-full transition-all hover:scale-125 ${
              answers[c.id] === "YES" ? "bg-emerald-500" :
              answers[c.id] === "NO"  ? "bg-red-400" :
              idx === current         ? "bg-primary scale-125" :
                                        "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Completion banner */}
      {allDone && (
        <Card className="border-emerald-400 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-700">All assumptions validated!</p>
          <p className="mt-1 text-xs text-emerald-600">
            Your answers will improve the accuracy of future simulations.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/futures")}>Future Simulation →</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/preferences")}>Preferences →</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 3 · Assumption Validation</div>
      <h1 className="mt-1 text-2xl font-bold">Validate Assumptions</h1>
      <p className="mt-1 text-sm text-foreground/60">Answer each assumption with Yes or No to calibrate your future simulations.</p>
    </div>
  );
}