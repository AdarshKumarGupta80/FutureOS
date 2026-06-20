import type React from "react";
import { Button } from "./Button";
import { Card } from "./Card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3 text-[13px] text-fo-muted">
      <span className="ai-dot" />
      <span>{label}</span>
      <div className="flex gap-1 ml-auto">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton h-2 rounded" style={{ width: 40 + i * 16 }} />
        ))}
      </div>
    </Card>
  );
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card p-6 text-center" style={{ background: "#1E293B", border: "0.5px solid #334155" }}>
      <i className="ti ti-inbox text-fo-faint mb-2 block" style={{ fontSize: 28 }} />
      <div className="text-[13px] text-fo-muted">{title}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="!border-fo-danger/30 !bg-fo-danger/5">
      <div className="flex items-start gap-3">
        <i className="ti ti-alert-triangle text-fo-danger mt-0.5" style={{ fontSize: 18 }} />
        <div className="flex-1 text-[13px]">
          <div className="font-medium text-fo-text mb-1">Something went wrong</div>
          <div className="text-fo-muted">{message}</div>
          {onRetry && (
            <Button className="mt-4" variant="ghost" size="sm" onClick={onRetry}>
              <i className="ti ti-refresh" /> Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ProgressBar({ value, color = "indigo" }: { value: number; color?: "indigo" | "success" }) {
  const width = Math.max(0, Math.min(100, value));
  const fill = color === "success" ? "#10B981" : "#6366F1";
  return (
    <div className="progress-track">
      <div className="progress-fill transition-all duration-500" style={{ width: `${width}%`, background: fill }} />
    </div>
  );
}