import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState, LoadingState, ProgressBar } from "../components/ui/State";
import { api, FutureBranch } from "../lib/api";

export function FutureSimulationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function load() {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function simulate() {
    setLoading(true);
    setError("");
    try {
      const result = await api.regenerateFutures();
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <LoadingState label="Loading futures…" />;

  const branches: FutureBranch[] = data.futureBranches ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 4 · Future Simulation</div>
          <h1 className="mt-1 text-2xl font-bold">Future Branches</h1>
          <p className="mt-1 text-sm text-foreground/60">AI-generated career paths based on your profile and goals.</p>
        </div>
        <Button onClick={simulate} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Simulating…" : "Re-Simulate"}
        </Button>
      </div>

      {error && <ErrorState message={error} onRetry={simulate} />}

      {!branches.length ? (
        <EmptyState
          title="No future branches yet. Run onboarding to generate your first simulation."
          action={<Button onClick={() => navigate("/onboarding")}>Go to Onboarding</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {branches.map((f) => (
              <BranchCard key={f.id} future={f} />
            ))}
          </div>

          {branches.length >= 2 && <ComparisonTable branches={branches} />}

          <Card className="border-primary/30 bg-primary/5">
            <p className="text-sm font-semibold">Ready to choose a future?</p>
            <p className="mt-1 text-xs text-foreground/60">Adjust your preferences first, then select the future that best fits your vision.</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => navigate("/preferences")}>Adjust Preferences →</Button>
              <Button variant="secondary" onClick={() => navigate("/future-selection")}>Select a Future →</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function BranchCard({ future }: { future: FutureBranch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <GitBranch className="mb-2 text-primary" size={20} />
          <h3 className="text-lg font-bold">{future.title}</h3>
          <div className="mt-1 text-xs text-foreground/60">
            Match {Math.round(future.score)} · Confidence {Math.round(future.confidenceScore ?? 0)}
          </div>
          <div className="mt-2 w-40">
            <ProgressBar value={future.score} />
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm md:grid-cols-2">
        <InfoBox title="Why it fits" value={future.whyItFits} />
        <InfoBox title="Risks" value={future.risks} />
        <InfoBox title="Skills required" value={future.skillsRequired} />
        <InfoBox title="Lifestyle impact" value={future.lifestyleImpact} />
      </div>

      <div className="mt-3 rounded-md bg-muted p-3 text-xs text-foreground/70">{future.timeline}</div>

      {expanded && (
        <>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <InfoBox title="Tradeoffs" value={future.tradeoffs} />
            <InfoBox title="Opportunities" value={future.opportunities} />
          </div>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
            <InfoBox title="1 Year" value={future.oneYearOutlook} />
            <InfoBox title="3 Years" value={future.threeYearOutlook} />
            <InfoBox title="5 Years" value={future.fiveYearOutlook} />
          </div>
          <div className="mt-3 rounded-md border border-border p-2 text-xs text-foreground/50">
            Assumptions: {future.assumptionsUsed}
          </div>
        </>
      )}

      <button
        className="mt-3 text-xs text-primary hover:underline"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Show less ↑" : "Show full outlook ↓"}
      </button>
    </Card>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="mb-1 text-xs font-semibold text-foreground/60">{title}</div>
      <div className="text-foreground/80">{value || "Not enough evidence yet."}</div>
    </div>
  );
}

function ComparisonTable({ branches }: { branches: FutureBranch[] }) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Future Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-foreground/50">
              <th className="border-b border-border py-2 pr-4">Future</th>
              <th className="border-b border-border py-2 pr-4">Match</th>
              <th className="border-b border-border py-2 pr-4">Confidence</th>
              <th className="border-b border-border py-2 pr-4">Timeline</th>
              <th className="border-b border-border py-2">Primary Risk</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id}>
                <td className="border-b border-border py-2 pr-4 font-semibold">{b.title}</td>
                <td className="border-b border-border py-2 pr-4">{Math.round(b.score)}</td>
                <td className="border-b border-border py-2 pr-4">{Math.round(b.confidenceScore ?? 0)}</td>
                <td className="border-b border-border py-2 pr-4 max-w-xs truncate">{b.timeline}</td>
                <td className="border-b border-border py-2 max-w-xs truncate">{b.risks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
