import { Minus, Plus } from "lucide-react";

import { cn } from "../../lib/utils";

function roundTo(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/**
 * Campo numérico com botões de −/+ grandes (alvos de toque de 44px), pensado
 * para preenchimento rápido com uma mão durante o treino. O valor central
 * continua editável pelo teclado (com `inputMode` adequado ao mobile).
 *
 * É controlado — feito para uso com `Controller` do React Hook Form:
 * receba `value`/`onChange`/`onBlur`/`name` do `field`.
 *
 * @param {string|number} [value]      Valor atual (string vazia quando não preenchido).
 * @param {(v: string) => void} onChange Notifica o novo valor (sempre string).
 * @param {number} [step=1]            Incremento aplicado pelos botões.
 * @param {number} [min]               Limite inferior.
 * @param {number} [max]               Limite superior.
 * @param {number} [precision=0]       Casas decimais ao usar os botões.
 * @param {string} [inputMode="numeric"] "decimal" aceita vírgula/ponto.
 */
export function NumberStepper({
  value,
  onChange,
  onBlur,
  name,
  id,
  step = 1,
  min = 0,
  max,
  precision = 0,
  placeholder = "0",
  inputMode = "numeric",
  className,
  ...props
}) {
  const applyStep = (direction) => {
    const raw = value === "" || value === null || value === undefined ? NaN : Number(value);
    const base = Number.isNaN(raw) ? min ?? 0 : raw;

    let next = base + direction * step;
    if (min !== null && min !== undefined) next = Math.max(min, next);
    if (max !== null && max !== undefined) next = Math.min(max, next);
    next = roundTo(next, precision);

    onChange(String(next));
  };

  const handleChange = (event) => {
    const raw = event.target.value;
    // Em campos decimais o aluno pode digitar vírgula (pt-BR); normalizamos para
    // ponto, que é o formato aceito pela validação numérica (Yup).
    onChange(inputMode === "decimal" ? raw.replace(",", ".") : raw);
  };

  return (
    <div
      className={cn(
        "flex h-11 w-full items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background aria-[invalid=true]:border-destructive",
        className,
      )}
      aria-invalid={props["aria-invalid"]}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Diminuir"
        onClick={() => applyStep(-1)}
        className="flex w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent/70"
      >
        <Minus className="h-4 w-4" />
      </button>

      <input
        id={id}
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={onBlur}
        inputMode={inputMode}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-x border-border bg-transparent text-center text-base font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70"
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label="Aumentar"
        onClick={() => applyStep(1)}
        className="flex w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent/70"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
