import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingState } from "../components/ui/State";
import { api } from "../lib/api";

const SLIDERS = [
  { key: "financialSecurity", label: "Financial Security", desc: "How important is stable income vs. upside potential?", low: "Risk income", high: "Stable income" },
  { key: "careerGrowth", label: "Career Growth", desc: "How much do you prioritize advancement speed?", low: "Steady pace", high: "Fast growth" },
  { key: "autonomy", label: "Autonomy", desc: "How much do you want to control your own direction?", low: "Guided structure", high: "Full independence" },
  { key: "riskTolerance", label: "Risk Tolerance", desc: "How comfortable are you with uncertainty?", low: "Risk-averse", high: "High risk OK" },
];

export function PreferenceSlidersPage() {
  const [data, setData] = useState<any>(null);
  const [prefs, setPrefs] = useState({ financialSecurity: 5, careerGrowth: 8, autonomy: 7, riskTolerance: 5 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();

  function load() {
    api.dashboard().then((d) => {
      setData(d);
      if (d.preferences) {
        setPrefs({
          financialSecurity: d.preferences.financialSecurity ?? 5,
          careerGrowth: d.preferences.careerGrowth ?? 8,
          autonomy: d.preferences.autonomy ?? 7,
          riskTolerance: d.preferences.riskTolerance ?? 5,
        });
      }
    });
  }
  useEffect(load, []);

  async function save() {
    setSaving(true);
    try {
      await api.preferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function saveAndRegenerate() {
    setRegenerating(true);
    try {
      await api.preferences(prefs);
      await api.regenerateFutures();
      navigate("/futures");
    } finally {
      setRegenerating(false);
    }
  }

  if (!data) return <LoadingState label="Loading preferences…" />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Step 5 · Preferences</div>
        <h1 className="mt-1 text-2xl font-bold">Preference Sliders</h1>
        <p className="mt-1 text-sm text-foreground/60">Tune these to re-score and regenerate your future branches.</p>
      </div>

      <div className="space-y-4">
        {SLIDERS.map(({ key, label, desc, low, high }) => {
          const val = prefs[key as keyof typeof prefs];
          return (
            <Card key={key}>
              <div className="mb-1 flex items-center justify-between">
                <div className="font-semibold">{label}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
                  {val}
                </div>
              </div>
              <p className="mb-3 text-xs text-foreground/60">{desc}</p>
              <input
                type="range"
                min={1}
                max={10}
                value={val}
                onChange={(e) => setPrefs((p) => ({ ...p, [key]: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-foreground/50">
                <span>{low}</span>
                <span>{high}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving}>
          <Save size={16} />
          {saved ? "Saved!" : saving ? "Saving…" : "Save Preferences"}
        </Button>
        <Button variant="secondary" onClick={saveAndRegenerate} disabled={regenerating}>
          <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
          {regenerating ? "Regenerating…" : "Save & Regenerate Futures"}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/future-selection")}>
          Select a Future →
        </Button>
      </div>
    </div>
  );
}
