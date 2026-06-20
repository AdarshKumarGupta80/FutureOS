import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = mode === "login"
        ? await api.login(email, password)
        : await api.register(fullName, email, password);
      localStorage.setItem("futureos_token", res.token);
      localStorage.setItem("futureos_name", res.fullName);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0F172A", display: "grid" }}
      className="lg:grid-cols-[1.1fr_0.9fr]">

      {/* ── Left hero panel ── */}
      <section style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        borderRight: "0.5px solid #334155",
        padding: "40px 48px",
      }} className="hidden lg:flex">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-brain" style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#F1F5F9" }}>FutureOS</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Clarity Through AI</div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span className="ai-dot" />
            <span style={{ fontSize: 11, color: "#22D3EE", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AI-Powered Career OS
            </span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 500, lineHeight: 1.15, color: "#F1F5F9", marginBottom: 20 }}>
            Move from confusion<br />to accountable action.
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.7, maxWidth: 440 }}>
            Dashboards, future branches, roadmaps, experiments, and progress systems powered by background AI.
          </p>
          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
            {["Assumption Validation","Future Simulation","Gap Analysis","Life Experiments","Accountability Loop"].map(f => (
              <span key={f} style={{
                fontSize: 11, color: "#6366F1",
                background: "rgba(99,102,241,0.1)",
                border: "0.5px solid rgba(99,102,241,0.25)",
                borderRadius: 99, padding: "4px 12px",
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 12, color: "#475569" }}>
          FutureOS — Design Your Future Before You Live It
        </div>
      </section>

      {/* ── Right auth panel ── */}
      <section style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, minHeight: "100vh",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}
            className="lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-brain" style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>FutureOS</span>
          </div>

          {/* Card */}
          <div style={{
            background: "#1E293B", border: "0.5px solid #334155",
            borderRadius: 16, padding: 28,
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#F1F5F9", marginBottom: 4 }}>
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>
                {mode === "login" ? "Sign in to continue your journey" : "Start designing your future"}
              </p>
            </div>

            {/* Mode toggle */}
            <div style={{
              display: "flex", gap: 4, padding: 4,
              background: "#0F172A", borderRadius: 10, marginBottom: 24,
            }}>
              {(["login","register"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "7px 12px",
                    borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                    background: mode === m ? "#6366F1" : "transparent",
                    color: mode === m ? "#fff" : "#64748B",
                  }}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mode === "register" && (
                <div>
                  <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>Full Name</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>Password</label>
                <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
              </div>

              {error && (
                <div style={{
                  background: "rgba(69,10,10,0.27)", border: "0.5px solid rgba(239,68,68,0.27)",
                  borderRadius: 8, padding: "10px 12px",
                  fontSize: 12, color: "#EF4444", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <i className="ti ti-alert-circle" /> {error}
                </div>
              )}

              <Button
                className="w-full mt-2"
                style={{ height: 40 }}
                onClick={submit as any}
                disabled={loading}
              >
                {loading
                  ? <><span className="ai-dot" style={{ width: 6, height: 6 }} /> Processing...</>
                  : <>{mode === "login" ? "Sign In" : "Create Account"} <i className="ti ti-arrow-right" /></>
                }
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}