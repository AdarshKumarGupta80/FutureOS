import { cn } from "../../lib/utils";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "experiment";
  size?: "sm" | "md" | "lg";
}) {
  const { className, variant = "primary", size = "md", ...rest } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-35",
        size === "sm" && "h-8 px-3 text-[12px] rounded-btn",
        size === "md" && "h-9 px-5 text-[13px] rounded-btn",
        size === "lg" && "h-11 px-6 text-sm rounded-btn",
        variant === "primary"    && "bg-fo-indigo text-white hover:opacity-[0.88] border-0",
        variant === "secondary"  && "bg-transparent text-fo-indigo border border-fo-indigo hover:bg-fo-indigo-m",
        variant === "ghost"      && "bg-transparent text-fo-muted border border-fo-border hover:bg-fo-surface hover:text-fo-text",
        variant === "danger"     && "bg-transparent text-fo-danger border border-fo-danger hover:bg-fo-danger/10",
        variant === "success"    && "bg-transparent text-fo-success border border-fo-success hover:bg-fo-success/10",
        variant === "experiment" && "bg-transparent text-fo-warning border border-fo-warning hover:bg-fo-warning/10",
        className
      )}
      {...rest}
    />
  );
}