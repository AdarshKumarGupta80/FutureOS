import { NavLink, Outlet, useNavigate } from "react-router-dom";

const workflow = [
  { group: "Setup", items: [
    { to: "/",            label: "Dashboard",        icon: "ti-layout-dashboard", end: true },
    { to: "/onboarding",  label: "AI Onboarding",    icon: "ti-sparkles" },
  ]},
  { group: "Explore", items: [
    { to: "/assumptions",     label: "Assumptions",      icon: "ti-shield-check" },
    { to: "/futures",         label: "Future Simulation", icon: "ti-git-branch" },
    { to: "/preferences",     label: "Preferences",      icon: "ti-adjustments-horizontal" },
    { to: "/future-selection",label: "Select Future",    icon: "ti-target" },
  ]},
  { group: "Plan", items: [
    { to: "/gap-analysis",      label: "Gap Analysis",      icon: "ti-chart-bar" },
    { to: "/decision-compiler", label: "Decision Compiler", icon: "ti-circuit-diode" },
    { to: "/roadmap",           label: "Roadmap",           icon: "ti-map" },
  ]},
  { group: "Execute", items: [
    { to: "/experiments",          label: "Life Experiments", icon: "ti-flask" },
    { to: "/progress",             label: "Action Tracking",  icon: "ti-checkbox" },
    { to: "/accountability",       label: "Accountability",   icon: "ti-shield" },
    { to: "/continuous-improvement", label: "Improvement",   icon: "ti-trending-up" },
  ]},
  { group: "Settings", items: [
    { to: "/settings", label: "Settings", icon: "ti-settings" },
  ]},
];

export function AppLayout() {
  const navigate = useNavigate();
  const name = localStorage.getItem("futureos_name") ?? "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  function signOut() {
    localStorage.removeItem("futureos_token");
    localStorage.removeItem("futureos_name");
    navigate("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F172A", color: "#F1F5F9" }}>

      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 hidden lg:flex flex-col overflow-y-auto"
        style={{
          width: 228,
          background: "#1E293B",
          borderRight: "0.5px solid #334155",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#6366F1",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-brain" style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", letterSpacing: "-0.01em" }}>FutureOS</div>
              <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>Clarity Through AI</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          {workflow.map((group) => (
            <div key={group.group} style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ padding: "0 8px", marginBottom: 6 }}>
                {group.group}
              </div>
              {group.items.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={"end" in link ? link.end : false}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#6366F1" : "#64748B",
                    background: isActive ? "#1e1e3a" : "transparent",
                    marginBottom: 2,
                    textDecoration: "none",
                    transition: "background 0.1s, color 0.1s",
                  })}
                  className="nav-item-link"
                >
                  <i className={`ti ${link.icon}`} style={{ fontSize: 15, flexShrink: 0 }} />
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "0.5px solid #334155",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(99,102,241,0.2)",
              border: "0.5px solid rgba(99,102,241,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "#6366F1",
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </div>
              <button
                onClick={signOut}
                style={{
                  fontSize: 11, color: "#64748B", background: "none",
                  border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
              >
                <i className="ti ti-logout" style={{ fontSize: 12 }} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between lg:hidden"
        style={{
          height: 52,
          background: "rgba(15,23,42,0.95)",
          borderBottom: "0.5px solid #334155",
          padding: "0 16px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-brain" style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>FutureOS</span>
        </div>
        <button
          onClick={signOut}
          style={{
            background: "transparent", border: "0.5px solid #334155",
            borderRadius: 8, padding: "5px 10px",
            color: "#94A3B8", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className="ti ti-logout" style={{ fontSize: 13 }} /> Sign out
        </button>
      </header>

      {/* ── Main content ── */}
      <main style={{ paddingLeft: 0 }} className="lg:pl-[228px]">
        <div className="page-enter" style={{ padding: "28px 32px", maxWidth: 1100 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}