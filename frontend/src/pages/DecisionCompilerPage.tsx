import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, LoadingState } from "../components/ui/State";
import { api } from "../lib/api";

export function DecisionCompilerPage() {
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => { api.dashboard().then(setData); }, []);

  if (!data) return <LoadingState label="Loading decision graph…" />;

  const graph = data.decisionGraphs?.[0];
  const roadmap = data.roadmaps?.[0];
  const selected = data.selectedFuture?.futureBranch;
  const gap = data.gapReports?.[0];

  const nodes = parseJson(graph?.nodesJson);
  const edges = parseJson(graph?.edgesJson);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 8 · Decision Compiler</div>
        <h1 className="mt-1 text-2xl font-bold">Decision Compiler</h1>
        <p className="mt-1 text-sm text-foreground/60">Visual dependency graph from your current state to your chosen future.</p>
      </div>

      {/* Prerequisites checker */}
      <div className="grid gap-3 sm:grid-cols-3">
        <PrereqCard label="Future Selected" done={!!selected} value={selected?.title} link="/future-selection" />
        <PrereqCard label="Gap Analysis" done={!!gap} value={gap ? `${Math.round(gap.confidenceScore)}% confidence` : undefined} link="/gap-analysis" />
        <PrereqCard label="Roadmap Generated" done={!!roadmap} value={roadmap?.title} link="/roadmap" />
      </div>

      {!graph && !roadmap ? (
        <Card>
          <p className="text-sm font-semibold">No decision graph yet.</p>
          <p className="mt-1 text-xs text-foreground/60">Generate a roadmap to compile the dependency graph.</p>
          <Button className="mt-4" onClick={() => navigate("/roadmap")}>Generate Roadmap →</Button>
        </Card>
      ) : (
        <>
          {nodes.length > 0 && (
            <Card>
              <h2 className="mb-4 font-bold">Dependency Graph</h2>
              <DependencyGraph nodes={nodes} edges={edges} />
            </Card>
          )}
          {roadmap?.decisionTree && (
            <Card>
              <h2 className="mb-3 font-bold">Decision Tree</h2>
              <pre className="whitespace-pre-wrap text-sm text-foreground/70">{roadmap.decisionTree}</pre>
            </Card>
          )}
          <div className="flex gap-3">
            <Button onClick={() => navigate("/roadmap")}>View Roadmap →</Button>
          </div>
        </>
      )}
    </div>
  );
}

function PrereqCard({ label, done, value, link }: { label: string; done: boolean; value?: string; link: string }) {
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition hover:border-primary/50 ${done ? "border-emerald-500/30 bg-emerald-500/10" : "border-border"}`}
      onClick={() => !done && navigate(link)}
    >
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-500 text-white" : "bg-muted text-foreground/50"}`}>
        {done ? "✓" : "!"}
      </div>
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        {value ? <div className="text-xs text-foreground/60 truncate max-w-[140px]">{value}</div> : <div className="text-xs text-foreground/60">{done ? "Done" : "Pending →"}</div>}
      </div>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  future: "bg-primary text-white",
  skill: "bg-blue-500 text-white",
  proof: "bg-purple-500 text-white",
  milestone: "bg-amber-500 text-white",
  outcome: "bg-emerald-500 text-white",
};

function DependencyGraph({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const [highlight, setHighlight] = useState<string | null>(null);

  if (!nodes.length) return <EmptyState title="No graph data available." />;

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-start gap-4 pb-2">
        {nodes.map((node, i) => {
          const active = highlight === node.id || edges.some((e) => e.from === highlight && e.to === node.id);
          const deps = edges.filter((e) => e.to === node.id).length;
          const outputs = edges.filter((e) => e.from === node.id).length;
          return (
            <div key={node.id} className="flex items-center gap-3">
              <button
                onClick={() => setHighlight(highlight === node.id ? null : node.id)}
                className={`relative flex min-w-[140px] flex-col items-start rounded-xl border-2 p-4 text-left transition
                  ${active ? "border-primary scale-105 shadow-md" : "border-border hover:border-primary/50"}
                `}
              >
                <span className={`mb-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLORS[node.type] ?? "bg-muted"}`}>
                  {node.type}
                </span>
                <span className="text-sm font-semibold leading-tight">{node.label}</span>
                <span className="mt-2 text-xs text-foreground/50">{deps} in · {outputs} out</span>
              </button>
              {i < nodes.length - 1 && (
                <ChevronRight className="shrink-0 text-foreground/30" size={20} />
              )}
            </div>
          );
        })}
      </div>
      {highlight && (
        <div className="mt-3 text-xs text-foreground/60">
          Connections: {edges.filter((e) => e.from === highlight || e.to === highlight).map((e) => `${e.from} → ${e.to}`).join(", ")}
        </div>
      )}
    </div>
  );
}

function parseJson(value?: string) {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}