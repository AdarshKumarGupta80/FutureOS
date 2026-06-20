import { AlertTriangle, Loader2 } from "lucide-react";
import type React from "react";
import { Button } from "./Button";
import { Card } from "./Card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <Card className="flex items-center gap-3 text-sm text-foreground/70"><Loader2 className="animate-spin text-primary" size={18} />{label}</Card>;
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="rounded-md border border-border p-4 text-sm text-foreground/70"><div>{title}</div>{action && <div className="mt-4">{action}</div>}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-red-400/50 bg-red-500/10">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-500" size={18} />
        <div className="flex-1 text-sm">
          <div className="font-semibold">Something needs attention</div>
          <div className="mt-1 text-foreground/70">{message}</div>
          {onRetry && <Button className="mt-4" variant="secondary" onClick={onRetry}>Retry</Button>}
        </div>
      </div>
    </Card>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${width}%` }} /></div>;
}
