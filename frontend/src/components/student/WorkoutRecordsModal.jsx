import { Check, Trophy } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
 * Uma linha de evolução: valor anterior → novo valor, com o ganho em destaque.
 */
function ImprovementRow({ improvement }) {
  const label = METRIC_LABEL[improvement.metric] ?? improvement.metric;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="text-muted-foreground line-through">
        {formatValue(improvement.previous, improvement.unit)}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="font-bold text-foreground">
        {formatValue(improvement.current, improvement.unit)}
      </span>
      <span className="font-semibold text-success">
        ({formatDelta(improvement.delta, improvement.unit)})
      </span>
    </div>
  );
}

/**
 * Card de um exercício que evoluiu, com entrada animada (stagger via delay).
 */
function RecordCard({ record, index }) {
  return (
    <div
      className="flex gap-3 rounded-xl border border-border/60 bg-surface p-4 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${120 + index * 90}ms`, animationFillMode: "both" }}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">
            {record.exercise?.name || "Exercício"}
          </span>
          {record.exercise?.muscle_group ? (
            <Badge variant="outline" className="text-[0.65rem]">
              {record.exercise.muscle_group}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1">
          {(record.improvements || []).map((improvement) => (
            <ImprovementRow key={improvement.metric} improvement={improvement} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Tela de celebração exibida ao concluir um treino em que o aluno bateu ao menos
 * um recorde pessoal. Não é renderizada quando não há recordes — quem controla
 * isso é a página do treino, que só abre a modal com `records` não vazio.
 */
export default function WorkoutRecordsModal({ open, onClose, records = [] }) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <div className="flex flex-col items-center gap-3 border-b border-border/80 px-6 py-7 text-center sm:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500 animate-in zoom-in-50 duration-300">
          <Trophy className="h-8 w-8" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Você bateu novos recordes!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua evolução em relação à última vez que treinou.
          </p>
        </div>
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

      <div className="border-t border-border/80 px-6 py-4 sm:px-8">
        <Button className="w-full" onClick={onClose}>
          Continuar
        </Button>
      </div>
    </Dialog>
  );
}
