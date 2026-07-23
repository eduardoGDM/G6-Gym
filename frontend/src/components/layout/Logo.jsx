import { Dumbbell } from "lucide-react";

export default function Logo({ compact = false, roleLabel }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
        <Dumbbell className="h-5 w-5" />
      </div>

      {!compact ? (
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold tracking-tight text-foreground">
              G6Fit
            </p>
            {roleLabel ? (
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                {roleLabel}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Gestão de treinos
          </p>
        </div>
      ) : null}
    </div>
  );
}
