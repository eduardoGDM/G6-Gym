import { cn } from "../../lib/utils";

const toneStyles = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  destructive: "bg-destructive/15 text-destructive",
};

export default function EmptyState({
  icon: Icon,
  tone = "primary",
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-in fade-in duration-300",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            toneStyles[tone],
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      ) : null}

      {title ? (
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      {action || null}
    </div>
  );
}
