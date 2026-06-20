import { cn } from "../../lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "fo-input h-9",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "fo-input min-h-[112px] py-2 resize-y",
        props.className
      )}
    />
  );
}