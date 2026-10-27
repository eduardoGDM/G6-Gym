import { ArrowRight, Repeat2, Undo2 } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { buildConfigSummary, formatWeight } from "../../../trainer/Workouts/utils";

/**
 * Chip de uma informação da prescrição. Não renderiza quando o personal não
 * preencheu o campo, para não deixar rótulo sem valor no card.
 */
function ConfigChip({ label, value }) {
  if (!value) return null;

  return (
    <span className="inline-flex items-baseline gap-1 rounded-md bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
      <span className="font-medium uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

/**
 * Um exercício do treino na tela de troca.
 *
 * A prescrição (séries, repetições, carga, RIR, descanso) aparece só para
 * leitura: ela pertence ao personal e não muda na troca — o aluno altera apenas
 * qual exercício ocupa a posição. Quando há troca pendente, o card mostra
 * "original → novo" e oferece desfazer antes de salvar.
 */
export default function ExerciseSwapCard({
  workoutExercise,
  selectedExercise,
  onSwap,
  onUndo,
  disabled = false,
}) {
  const original = workoutExercise.exercise;
  const current = selectedExercise || original;
  const changed = Boolean(selectedExercise);

  const series = [...(workoutExercise.series || [])].sort(
    (a, b) => a.order - b.order,
  );
  const config = buildConfigSummary(series);

  return (
    <div
      className={[
        "rounded-2xl border bg-card/60 p-4 transition-colors sm:p-5",
        changed ? "border-primary/50 bg-primary/5" : "border-border/70",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {workoutExercise.order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-tight text-foreground">
              {current?.name || "—"}
            </p>
            {changed ? (
              <Badge className="px-2 py-0.5 text-[11px] uppercase tracking-wide">
                Alterado
              </Badge>
            ) : null}
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {current?.muscle_group?.name || "Sem grupo muscular"}
          </p>

          {changed ? (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="line-through">{original?.name || "—"}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {current?.name}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {changed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={disabled}
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Desfazer
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwap}
            disabled={disabled}
          >
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            Trocar
          </Button>
        </div>
      </div>

      {/* Estrutura preservada na troca — exibida para o aluno conferir, nunca
          editável aqui. */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
        {series.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            Nenhuma série prescrita.
          </span>
        ) : (
          <>
            <span className="text-xs font-semibold text-foreground">
              {config.count} {config.count === 1 ? "série" : "séries"}
            </span>
            <ConfigChip label="Reps" value={config.repetitions.join(" · ")} />
            <ConfigChip
              label="Carga"
              value={series
                .map((item) => formatWeight(item.weight))
                .filter(Boolean)
                .filter((value, index, list) => list.indexOf(value) === index)
                .join(" · ")}
            />
            <ConfigChip label="RIR" value={config.rir.join(" · ")} />
            <ConfigChip label="Descanso" value={config.rest.join(" · ")} />
            <ConfigChip label="Técnica" value={config.techniques.join(" · ")} />
          </>
        )}
      </div>
    </div>
  );
}
