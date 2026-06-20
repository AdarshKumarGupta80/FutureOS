import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = mode === "login" ? await api.login(email, password) : await api.register(fullName, email, password);
      localStorage.setItem("futureos_token", res.token);
      localStorage.setItem("futureos_name", res.fullName);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between border-r border-border p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
            <BrainCircuit />
          </div>
          <div>
            <div className="font-bold text-2xl">FutureOS</div>
            <div className="text-2xl text-foreground/60">Design Your Future Before You Live It</div>
          </div>
        </div>
        <div className="max-w-2xl py-12">
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">Move from confusion to accountable action.</h1>
          <p className="mt-5 max-w-xl text-lg text-foreground/70">Dashboards, future branches, roadmaps, experiments, and progress systems powered by background AI.</p>
        </div>
        <div className="grid gap-3 text-sm text-foreground/70 md:grid-cols-3">
          <div>Assumption validation</div>
          <div>Future simulation</div>
          <div>Accountability loop</div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <div className="mb-6 flex gap-2">
            <Button className="flex-1" variant={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")}>Login</Button>
            <Button className="flex-1" variant={mode === "register" ? "primary" : "secondary"} onClick={() => setMode("register")}>Register</Button>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" && <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />}
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            {error && <div className="rounded-md border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</div>}
            <Button className="w-full" type="submit">{mode === "login" ? "Login" : "Register"}</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
