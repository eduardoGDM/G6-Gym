import RecordStamp from "../ficha/RecordStamp";
import TapeDivider from "../ficha/TapeDivider";
import { Dialog } from "../ui/dialog";

// Rótulo de cada critério de recorde. Mantido no frontend para separar a
// apresentação (i18n/formatação) do payload cru vindo da API.
const METRIC_LABEL = {
  weight: "Carga",
  reps: "Repetições",
  volume: "Volume",
};

// Números no padrão pt-BR: "2400" → "2.400". Carga pode ter casas decimais
// (82,5), repetições nunca — deixamos o Intl decidir pelo próprio valor.
const formatNumber = (value) =>
  Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const formatValue = (value, unit) =>
  unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);

const formatDelta = (delta, unit) => {
  const sign = Number(delta) > 0 ? "+" : "";
  return `${sign}${formatValue(delta, unit)}`;
};

/**
 * Uma linha de evolução: o valor anterior riscado à mão, o novo em número
 * grande e o ganho em anilha. O risco repete a marcação de série concluída —
 * o que passou está riscado, não apagado.
 */
function ImprovementRow({ improvement }) {
  const label = METRIC_LABEL[improvement.metric] ?? improvement.metric;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border pt-2.5">
      <span className="w-20 shrink-0 text-muted-foreground ficha-label">
        {label}
      </span>

      <span className="relative inline-block text-sm text-muted-foreground ficha-mono">
        {formatValue(improvement.previous, improvement.unit)}
        <span
          aria-hidden="true"
          className="absolute -left-1 -right-1 top-1/2 h-[2px] origin-left -rotate-[1.2deg] bg-muted-foreground animate-strike"
        />
      </span>

      <span className="text-[22px] ficha-display">
        {formatValue(improvement.current, improvement.unit)}
      </span>

      <span className="text-sm font-semibold text-primary ficha-mono">
        {formatDelta(improvement.delta, improvement.unit)}
      </span>
    </div>
  );
}

/** Um exercício que evoluiu. Entrada escalonada pelo índice. */
function RecordCard({ record, index }) {
  return (
    <div
      className="border-2 border-border bg-card px-4 pb-4 pt-3.5 animate-rise"
      style={{ animationDelay: `${160 + index * 90}ms` }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-3">
        <span className="text-[17px] ficha-display">
          {record.exercise?.name || "Exercício"}
        </span>
        {record.exercise?.muscle_group ? (
          <span className="text-muted-foreground ficha-label">
            {record.exercise.muscle_group}
          </span>
        ) : null}
      </div>

      <div className="space-y-2.5">
        {(record.improvements || []).map((improvement) => (
          <ImprovementRow key={improvement.metric} improvement={improvement} />
        ))}
      </div>
    </div>
  );
}

/**
 * Tela de celebração exibida ao concluir um treino em que o aluno bateu ao menos
 * um recorde pessoal. Não é renderizada quando não há recordes — quem controla
 * isso é a página do treino, que só abre a modal com `records` não vazio.
 *
 * O recorde é celebrado com CARIMBO, não com confete nem troféu dourado: é o
 * fecho da direção de arte do tema "A Ficha".
 */
export default function WorkoutRecordsModal({ open, onClose, records = [] }) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <div className="border-b-2 border-foreground px-6 pb-6 pt-7 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-muted-foreground ficha-label">
              {records.length}{" "}
              {records.length === 1 ? "novo recorde" : "novos recordes"}
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,6vw,2.5rem)] ficha-display">
              Está na ficha
            </h2>
          </div>

          <RecordStamp
            title="Recorde"
            detail="carga · reps · volume"
            delay={140}
            className="shrink-0"
          />
        </div>

        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Sua evolução em relação à última vez que você fez cada exercício.
        </p>
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-auto px-6 py-6 sm:px-8">
        {records.map((record, index) => (
          <RecordCard
            key={record.exercise?.id ?? index}
            record={record}
            index={index}
          />
        ))}
      </div>

      <div className="px-6 pb-6 sm:px-8">
        <TapeDivider delay={240} className="mb-5" />

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-14 w-full items-center justify-center border-2 border-foreground bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors duration-200 ficha-mono hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Continuar
        </button>
      </div>
    </Dialog>
  );
}
