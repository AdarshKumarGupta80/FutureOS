import { cn } from "../../lib/utils";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}) {
  const { className, variant = "primary", size = "md", ...rest } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" && "bg-primary text-white hover:brightness-110",
        variant === "secondary" && "border border-border bg-muted text-foreground hover:bg-border",
        variant === "ghost" && "hover:bg-muted",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-600",
        variant === "success" && "bg-emerald-500 text-white hover:bg-emerald-600",
        className
      )}
      {...rest}
    />
  );
}