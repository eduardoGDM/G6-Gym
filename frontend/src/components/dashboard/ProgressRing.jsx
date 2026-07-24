/**
 * Indicador circular pequeno de progresso (0–100). A cor acompanha o
 * desempenho: verde (alto), laranja (médio), vermelho (baixo) — como na
 * referência. Puramente visual.
 */
export default function ProgressRing({ value = 0, size = 42 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 15.9155; // circunferência ≈ 100
  const stroke = 3.2;

  const color =
    pct >= 70
      ? "var(--color-success)"
      : pct >= 40
        ? "var(--color-warning)"
        : "var(--color-destructive)";

  return (
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
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
    </div>
  );
}
