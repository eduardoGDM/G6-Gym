import { cn } from "../../lib/utils";

export function Table({ className, ...props }) {
  return (
    <table className={cn("min-w-full divide-y divide-border/70", className)} {...props} />
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-muted/30", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-border/60 bg-card/70", className)} {...props} />;
}

export function TableRow({ className, hoverable = true, ...props }) {
  return (
    <tr
      className={cn(hoverable && "transition-colors hover:bg-muted/10", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "px-3 py-3 text-left text-sm font-semibold text-foreground sm:px-4",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("px-3 py-3 text-sm text-muted-foreground sm:px-4", className)}
      {...props}
    />
  );
}
