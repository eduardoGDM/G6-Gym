import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

/**
 * Gráfico circular (donut) fino com percentual central, no estilo da
 * referência. Puramente visual — recebe um valor 0–100 já calculado.
 *
 * O raio é escolhido para a circunferência valer ~100, então o
 * strokeDasharray usa o próprio percentual diretamente.
 */
export default function DonutStat({
  value = 0,
  label,
  sublabel,
  size = 76,
  loading = false,
  delay = 0,
  className,
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 15.9155; // circunferência ≈ 100
  const stroke = 3.4;

  return (
    <Card
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 flex items-center gap-4 p-4 duration-300 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-border/70 sm:p-5",
        className,
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          {!loading ? (
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={stroke}
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-500 ease-out"
            />
          ) : null}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold tabular-nums text-foreground">
            {loading ? "—" : `${pct}%`}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </div>
    </Card>
  );
}
