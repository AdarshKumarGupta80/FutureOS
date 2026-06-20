import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/State";
import { api, GapReport } from "../lib/api";

export function GapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function load() {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      await api.generateGap();
      load();
    } catch (e: any) {
      setError(e.message ?? "Gap analysis failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <LoadingState label="Loading gap analysis…" />;

  const report: GapReport | null = data.gapReports?.[0] ?? null;
  const selected = data.selectedFuture?.futureBranch;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 7 · Gap Analysis</div>
          <h1 className="mt-1 text-2xl font-bold">Gap Analysis</h1>
          <p className="mt-1 text-sm text-foreground/60">AI analysis of the gap between your current state and your selected future.</p>
        </div>
        <Button onClick={generate} disabled={loading || !selected}>
          <BarChart3 size={16} />
          {loading ? "Analysing…" : report ? "Regenerate" : "Generate Gap Report"}
        </Button>
      </div>

      {!selected && (
        <Card className="border-amber-400 bg-amber-50">
          <div className="flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-amber-800">No future selected</p>
              <p className="mt-1 text-xs text-amber-700">Select a future branch first before running gap analysis.</p>
              <Button size="sm" className="mt-3" onClick={() => navigate("/future-selection")}>Select a Future →</Button>
            </div>
          </div>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={generate} />}

      {report ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="text-sm">
              <span className="font-semibold">Selected future:</span> {report.selectedFuture}
            </div>
            <div className="ml-auto flex items-center gap-1 text-sm font-semibold">
              <div className={`h-2 w-2 rounded-full ${report.confidenceScore >= 70 ? "bg-emerald-500" : report.confidenceScore >= 40 ? "bg-amber-500" : "bg-red-500"}`} />
              {Math.round(report.confidenceScore)}% confidence
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GapCard
              icon={<CheckCircle2 className="text-emerald-500" size={18} />}
              title="Verified Strengths"
              value={report.verifiedStrengths}
              variant="positive"
            />
            <GapCard
              icon={<AlertTriangle className="text-amber-500" size={18} />}
              title="Missing Skills"
              value={report.missingSkills}
            />
            <GapCard
              icon={<AlertTriangle className="text-amber-500" size={18} />}
              title="Missing Projects"
              value={report.missingProjects}
            />
            <GapCard
              icon={<AlertTriangle className="text-amber-500" size={18} />}
              title="Missing Experience"
              value={report.missingExperience}
            />
            <GapCard
              icon={<AlertTriangle className="text-amber-500" size={18} />}
              title="Missing Certifications"
              value={report.missingCertifications}
            />
            <GapCard
              title="Current State"
              value={report.currentState}
            />
          </div>

          <Card>
            <h3 className="font-semibold">Evidence Reasoning</h3>
            <p className="mt-3 text-sm text-foreground/70 whitespace-pre-line">{report.evidenceReasoning}</p>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/decision-compiler")}>Compile Decision →</Button>
            <Button variant="secondary" onClick={() => navigate("/roadmap")}>Generate Roadmap →</Button>
          </div>
        </div>
      ) : (
        !error && selected && (
          <EmptyState title="No gap report yet. Click Generate Gap Report above." />
        )
      )}
    </div>
  );
}

function GapCard({ icon, title, value, variant }: { icon?: React.ReactNode; title: string; value: string; variant?: "positive" }) {
  return (
    <Card className={variant === "positive" ? "border-emerald-300 bg-emerald-50/50" : ""}>
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-foreground/70">{value || "—"}</p>
    </Card>
  );
}
