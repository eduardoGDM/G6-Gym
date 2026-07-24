import { Minus, Plus } from "lucide-react";
import { useId } from "react";

import { cn } from "../../../../lib/utils";

const MIN = 0;
const MAX = 10;
const RADIUS = 57;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICKS = Array.from({ length: MAX + 1 }, (_, index) => index);

// Espelha DailyCheckin::ratingLevel() do backend (>=7 bom, >=4 atenção) apenas
// para dar leitura imediata enquanto o aluno ajusta a nota. A cor oficial do
// registro continua vindo do backend (`sleep_level`/`diet_level`) na listagem.
function qualityOf(value) {
  if (value >= 7) return { label: "Bom", className: "border-success/40 text-success" };
  if (value >= 4) return { label: "Atenção", className: "border-warning/40 text-warning" };
  return { label: "Ruim", className: "border-destructive/40 text-destructive" };
}

function StepButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border",
        "bg-gradient-to-b from-white/8 to-transparent text-primary shadow-subtle",
        "transition-[transform,background-color,border-color] duration-150",
        "hover:border-primary/50 hover:bg-primary/10",
        "active:scale-[0.87] active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
    </button>
  );
}

/**
 * Dial circular de nota 0–10: anel de progresso, número grande ao centro e
 * botões de −/+ com efeito de mola. Também aceita setas do teclado, Home/End
 * e roda do mouse sobre o anel.
 *
 * Controlado — feito para uso com `Controller` do React Hook Form.
 *
 * @param {string} id                    id usado no rótulo acessível.
 * @param {string} label                 Nome da métrica (ex.: "Nota do sono").
 * @param {number|""} value              Nota atual ("" quando não preenchida).
 * @param {(v: number) => void} onChange Notifica a nova nota.
 */
export default function RatingDial({ id, label, value, onChange }) {
  const gradientId = useId();

  const hasValue = value !== "" && value !== null && value !== undefined;
  const current = hasValue ? Number(value) : 0;
  const ratio = current / MAX;
  const quality = qualityOf(current);

  const setValue = (next) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    if (hasValue && clamped === current) return;
    onChange(clamped);
  };

  const handleKeyDown = (event) => {
    const steps = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };

    if (event.key in steps) {
      event.preventDefault();
      setValue(current + steps[event.key]);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setValue(MIN);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setValue(MAX);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <StepButton
          icon={Minus}
          label={`Diminuir ${label.toLowerCase()}`}
          onClick={() => setValue(current - 1)}
          disabled={hasValue && current === MIN}
        />

        <div
          id={id}
          role="spinbutton"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={hasValue ? current : undefined}
          aria-valuetext={hasValue ? `${current} de ${MAX} — ${quality.label}` : "Sem nota"}
          onKeyDown={handleKeyDown}
          onWheel={(event) => setValue(current + (event.deltaY < 0 ? 1 : -1))}
          className="relative h-[150px] w-[150px] shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {/* Halo interno: ganha intensidade conforme a nota sobe. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.35),transparent_70%)] transition-opacity duration-500"
            style={{ opacity: 0.15 + ratio * 0.7 }}
          />

          <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-dark)" />
                <stop offset="55%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-primary-hover)" />
              </linearGradient>
            </defs>

            {/* Marcações da escala, uma por ponto. */}
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-border">
              {TICKS.map((tick) => {
                const angle = (tick / MAX) * 2 * Math.PI;
                return (
                  <line
                    key={tick}
                    x1={75 + Math.cos(angle) * 68}
                    y1={75 + Math.sin(angle) * 68}
                    x2={75 + Math.cos(angle) * 72}
                    y2={75 + Math.sin(angle) * 72}
                  />
                );
              })}
            </g>

            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              strokeWidth="9"
              className="stroke-border/60"
            />
            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
              className="drop-shadow-[0_0_7px_rgba(239,68,68,0.45)] transition-[stroke-dashoffset] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
            />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {/* A key remonta o span a cada nota nova, reiniciando a mola. */}
            <span
              key={hasValue ? current : "empty"}
              className="animate-spring-pop font-mono text-[44px] font-bold leading-none tracking-tight text-foreground"
            >
              {hasValue ? current : "–"}
            </span>
            <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
              / {MAX}
            </span>
          </div>
        </div>

        <StepButton
          icon={Plus}
          label={`Aumentar ${label.toLowerCase()}`}
          onClick={() => setValue(current + 1)}
          disabled={hasValue && current === MAX}
        />
      </div>

      <p className="text-center">
        <span
          className={cn(
            "inline-block rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
            hasValue ? quality.className : "border-border text-muted-foreground",
          )}
        >
          {hasValue ? quality.label : "Sem nota"}
        </span>
      </p>
    </div>
  );
}
