import { cn } from "../../lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-fo-surface border rounded-card p-4 transition-all duration-150",
        "border-fo-border hover:border-fo-border-em hover:-translate-y-px",
        className
      )}
      style={{ borderWidth: "0.5px" }}
      {...props}
    />
  );
}