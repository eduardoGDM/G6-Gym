import { cn } from "../../lib/utils";

const selectSizes = {
  default: { field: "h-11 px-3.5 py-2.5 pr-10", chevron: "right-3 h-4 w-4" },
  sm: { field: "h-9 pl-3 pr-8 text-sm", chevron: "right-2.5 h-4 w-4" },
};

function Select({ className, children, size = "default", ...props }) {
  const styles = selectSizes[size] ?? selectSizes.default;

  return (
    <div className="relative">
      <select
        className={cn(
          "flex w-full appearance-none rounded-lg border border-border bg-card text-sm text-foreground shadow-subtle transition-colors hover:border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
          styles.field,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          styles.chevron,
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export { Select };
