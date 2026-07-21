import { cn } from "../../lib/utils";
import { forwardRef } from "react";

const Input = forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-subtle transition-colors hover:border-border/60 placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  );
});

export { Input };
