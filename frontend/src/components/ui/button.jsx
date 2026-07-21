import { Loader2 } from "lucide-react";

import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default:
      "bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary/90 focus-visible:ring-secondary",
    success:
      "bg-success text-success-foreground shadow-subtle hover:bg-success/90 focus-visible:ring-success",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
    ghost:
      "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
    destructive:
      "bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90 focus-visible:ring-destructive",
  },
  size: {
    default: "h-11 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-12 px-6",
    icon: "h-11 w-11 p-0",
  },
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  const Comp = asChild ? "span" : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className,
      )}
      disabled={asChild ? undefined : disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Comp>
  );
}
