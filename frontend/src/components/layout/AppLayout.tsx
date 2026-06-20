import {
  Activity, BarChart3, BookOpen, CheckSquare, ChevronRight,
  GitBranch, Home, LogOut, Map, Settings, ShieldCheck,
  Sliders, Sparkles, Target, TestTube, TrendingUp
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

const workflow = [
  { group: "Setup", items: [
    { to: "/", label: "Dashboard", icon: Home, end: true },
    { to: "/onboarding", label: "AI Onboarding", icon: Target },
  ]},
  { group: "Explore", items: [
    { to: "/assumptions", label: "Assumptions", icon: BookOpen },
    { to: "/futures", label: "Future Simulation", icon: Sparkles },
    { to: "/preferences", label: "Preferences", icon: Sliders },
    { to: "/future-selection", label: "Select Future", icon: GitBranch },
  ]},
  { group: "Plan", items: [
    { to: "/gap-analysis", label: "Gap Analysis", icon: BarChart3 },
    { to: "/decision-compiler", label: "Decision Compiler", icon: ChevronRight },
    { to: "/roadmap", label: "Roadmap", icon: Map },
  ]},
  { group: "Execute", items: [
    { to: "/experiments", label: "Life Experiments", icon: TestTube },
    { to: "/progress", label: "Action Tracking", icon: CheckSquare },
    { to: "/accountability", label: "AI Accountability", icon: ShieldCheck },
    { to: "/continuous-improvement", label: "Improvement", icon: TrendingUp },
  ]},
  { group: "Settings", items: [
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function AppLayout() {
  const navigate = useNavigate();
  const name = localStorage.getItem("futureos_name") ?? "User";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-border bg-background px-3 py-5 lg:block">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <Activity size={20} />
          </div>
          <div>
            <div className="font-bold">FutureOS</div>
            <div className="text-xs text-foreground/60">Design Your Future</div>
          </div>
        </div>
        <nav className="space-y-4">
          {workflow.map((group) => (
            <div key={group.group}>
              <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={"end" in link ? link.end : false}
                    className={({ isActive }) =>
                      `flex h-9 items-center gap-2.5 rounded-md px-2 text-sm ${
                        isActive ? "bg-primary/10 font-semibold text-primary" : "text-foreground/70 hover:bg-muted"
                      }`
                    }
                  >
                    <link.icon size={16} />
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4 px-2">
          <div className="text-xs text-foreground/50 mb-2">Signed in as</div>
          <div className="text-sm font-medium truncate">{name}</div>
          <button
            className="mt-2 flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground"
            onClick={() => { localStorage.removeItem("futureos_token"); localStorage.removeItem("futureos_name"); navigate("/login"); }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <Activity size={16} />
          </div>
          <span className="font-bold">FutureOS</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem("futureos_token"); navigate("/login"); }}>
          <LogOut size={16} />
        </Button>
      </header>

      <main className="lg:pl-64">
        <div className="px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
