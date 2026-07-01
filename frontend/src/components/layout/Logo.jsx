import { Dumbbell } from "lucide-react";

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Dumbbell className="h-5 w-5" />
      </div>

      {!compact ? (
        <div className="leading-tight">
          <p className="text-base font-bold text-foreground">G6</p>
          <p className="text-xs text-muted-foreground">Academia</p>
        </div>
      ) : null}
    </div>
  );
}
