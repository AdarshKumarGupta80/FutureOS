import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { api, OnboardingPayload } from "../lib/api";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

export function OnboardingPage() {
  const [form, setForm] = useState({
    goal: "",
    interests: "",
    biggestConfusion: "",
    weeklyAvailableHours: 12,
    background: "",
    portfolioUrl: ""
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [projectZipFile, setProjectZipFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const interestChips = useMemo(
    () => form.interests.split(",").map((interest) => interest.trim()).filter(Boolean),
    [form.interests]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedGoal = form.goal.trim();
    const trimmedConfusion = form.biggestConfusion.trim();
    const trimmedBackground = form.background.trim();
    const trimmedPortfolioUrl = form.portfolioUrl.trim();
    const weeklyAvailableHours = Number(form.weeklyAvailableHours);

    if (!trimmedGoal || !form.interests.trim() || !trimmedConfusion || !trimmedBackground) {
      setError("Please complete Goal, Interests, Current Confusion, and Skills & Experience before generating futures.");
      return;
    }

    if (!Number.isFinite(weeklyAvailableHours) || weeklyAvailableHours < 1 || weeklyAvailableHours > 80) {
      setError("Available Time Per Week must be between 1 and 80 hours.");
      return;
    }

    const payload: OnboardingPayload = {
      goal: trimmedGoal,
      biggestConfusion: trimmedConfusion,
      successDefinition: interestChips.length
        ? `Build a future aligned with these interests: ${interestChips.join(", ")}.`
        : "Build a clear, sustainable future path with measurable progress.",
      weeklyAvailableHours,
      background: [
        trimmedBackground,
        interestChips.length ? `Interests: ${interestChips.join(", ")}.` : "",
        resumeFile ? `Resume uploaded: ${resumeFile.name}.` : "",
        projectZipFile ? `Project ZIP uploaded: ${projectZipFile.name}.` : ""
      ].filter(Boolean).join("\n\n"),
      ...(trimmedPortfolioUrl ? { portfolioUrl: trimmedPortfolioUrl } : {})
    };

    console.log("FutureOS onboarding payload", payload);

    setSaving(true);
    try {
      await api.onboarding(payload);
      navigate("/assumptions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate your future system. Please check your inputs and try again.");
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={submit}>
      <Card className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">AI Onboarding</p>
          <h2 className="mt-1 text-2xl font-bold">Career Assessment</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Goal">
            <Input
              required
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="Become an AI Engineer"
            />
          </Field>

          <Field label="Available Time Per Week">
            <div className="relative">
              <Input
                required
                type="number"
                min={1}
                max={80}
                value={form.weeklyAvailableHours}
                onChange={(e) => setForm({ ...form, weeklyAvailableHours: Number(e.target.value) })}
                placeholder="12"
                className="pr-14"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">hours</span>
            </div>
          </Field>
        </div>

        <Field label="Interests">
          <Input
            required
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            placeholder="AI, Startups, Product Building"
          />
        </Field>

        {interestChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interestChips.map((interest) => (
              <span key={interest} className="rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/75">
                {interest}
              </span>
            ))}
          </div>
        )}

        <Field label="Current Confusion / Challenges">
          <Textarea
            required
            value={form.biggestConfusion}
            onChange={(e) => setForm({ ...form, biggestConfusion: e.target.value })}
            placeholder="Unsure whether to focus on AI Engineering or Product Management"
            className="min-h-24"
          />
        </Field>

        <Field label="Current Skills & Experience">
          <Textarea
            required
            value={form.background}
            onChange={(e) => setForm({ ...form, background: e.target.value })}
            placeholder="Java, Spring Boot, React, Personal Projects"
            className="min-h-24"
          />
        </Field>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Supporting Documents</h2>
            <p className="mt-1 text-sm text-foreground/60">Optional</p>
          </div>

          <Field label="Upload Resume">
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
          </Field>

          <Field label="Upload Project ZIP">
            <Input type="file" accept=".zip" onChange={(e) => setProjectZipFile(e.target.files?.[0] ?? null)} />
          </Field>

          <Field label="Portfolio URL">
            <Input
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.com"
              type="url"
            />
          </Field>
        </Card>

        {error && <div className="rounded-md border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</div>}

        <Button className="w-full" disabled={saving}>
          {saving ? "Generating..." : "Generate Future System"}
        </Button>
      </div>
    </form>
  );
}
