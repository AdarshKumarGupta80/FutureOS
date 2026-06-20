import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, GitBranch, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, LoadingState, ProgressBar } from "../components/ui/State";
import { api, FutureBranch } from "../lib/api";

export function FutureSelectionPage() {
  const [data, setData] = useState<any>(null);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    const d = await api.dashboard();
    setData(d);
  }

  useEffect(() => { load(); }, []);

  async function select(id: number) {
    setSelecting(id);
    setError("");
    try {
      await api.selectFuture(id);
      // Reload dashboard so selectedFuture reflects the new selection
      const d = await api.dashboard();
      setData(d);
    } catch (e: any) {
      setError(e.message ?? "Selection failed. Please try again.");
    } finally {
      setSelecting(null);
    }
  }

  if (!data) return <LoadingState label="Loading futures…" />;

  const branches: FutureBranch[] = data.futureBranches ?? [];
  const selected: FutureBranch | null = data.selectedFuture?.futureBranch ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 6 · Future Selection</div>
        <h1 className="mt-1 text-2xl font-bold">Select Your Future</h1>
        <p className="mt-1 text-sm text-foreground/60">Choose one future branch to lock in your roadmap direction.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success confirmation */}
      {selected && (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={20} />
            </div>
            <div>
              <div className="font-bold text-emerald-300">Selected: {selected.title}</div>
              <div className="text-xs text-emerald-200/80">
                Match {Math.round(selected.score)} · Confidence {Math.round(selected.confidenceScore ?? 0)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/gap-analysis")}>Run Gap Analysis →</Button>
            <Button variant="secondary" onClick={() => navigate("/futures")}>Back to Simulation</Button>
          </div>
        </Card>
      )}

      {/* Branch cards */}
      {!branches.length ? (
        <EmptyState
          title="No future branches yet. Run the Future Simulation first."
          action={<Button onClick={() => navigate("/futures")}>View Simulations</Button>}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {branches.map((f) => {
            const isSelected = selected?.id === f.id;
            const isSelecting = selecting === f.id;

            return (
              <Card
                key={f.id}
                className={`relative transition-all ${
                  isSelected
                    ? "border-emerald-400 ring-2 ring-emerald-500/30"
                    : "hover:border-primary/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={14} />
                  </div>
                )}

                <div className="mb-3">
                  <GitBranch className="mb-2 text-primary" size={20} />
                  <h3 className="text-lg font-bold pr-8">{f.title}</h3>
                  <div className="mt-1 text-xs text-foreground/60">
                    Match {Math.round(f.score)} · Confidence {Math.round(f.confidenceScore ?? 0)}
                  </div>
                  <div className="mt-2 w-36">
                    <ProgressBar value={f.score} />
                  </div>
                </div>

                <p className="mb-3 text-sm text-foreground/70">{f.whyItFits}</p>

                <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                  <Chip label="Skills" value={f.skillsRequired} />
                  <Chip label="Timeline" value={f.timeline} />
                  <Chip label="Risk" value={f.risks} />
                  <Chip label="Lifestyle" value={f.lifestyleImpact} />
                </div>

                <Button
                  className="w-full"
                  variant={isSelected ? "success" : "primary"}
                  disabled={selecting !== null} // disable ALL buttons while any is in-flight
                  onClick={() => select(f.id)}
                >
                  {isSelecting
                    ? "Selecting…"
                    : isSelected
                    ? "✓ Selected"
                    : "Select This Future"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border p-2">
      <div className="text-foreground/50">{label}</div>
      <div className="mt-0.5 line-clamp-2 font-medium">{value || "—"}</div>
    </div>
  );
}