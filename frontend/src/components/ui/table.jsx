import { cn } from "../../lib/utils";

export function Table({ className, ...props }) {
  return (
    <table className={cn("min-w-full divide-y divide-border/70", className)} {...props} />
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-surface/40", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return (
    <tbody className={cn("divide-y divide-border/50", className)} {...props} />
  );
}

export function TableRow({ className, hoverable = true, ...props }) {
  return (
    <tr
      className={cn(hoverable && "transition-colors hover:bg-accent/40", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("px-4 py-2.5 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
