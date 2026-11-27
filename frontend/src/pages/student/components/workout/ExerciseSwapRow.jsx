import { cn } from "../../../../lib/utils";
import { buildConfigSummary, formatWeight } from "../../../trainer/Workouts/utils";

/**
 * Resumo da prescrição em uma linha de ficha: só o que o personal preencheu,
 * separado por ponto médio. Substitui a fileira de chips — a informação é a
 * mesma, sem cinco caixas competindo com o nome do exercício.
 */
function prescriptionLine(series) {
  if (series.length === 0) return "Nenhuma série prescrita";

  const config = buildConfigSummary(series);

  const weights = series
    .map((item) => formatWeight(item.weight))
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);

  return [
    `${config.count} ${config.count === 1 ? "série" : "séries"}`,
    config.repetitions.length ? `reps ${config.repetitions.join("·")}` : null,
    weights.length ? `${weights.join("·")} kg` : null,
    config.rir.length ? `RIR ${config.rir.join("·")}` : null,
    config.rest.length ? `desc. ${config.rest.join("·")}` : null,
    config.techniques.length ? config.techniques.join("·") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Uma posição do treino na tela de troca.
 *
 * A prescrição (séries, repetições, carga, RIR, descanso) aparece só para
 * leitura: ela pertence ao personal e não muda na troca — o aluno altera apenas
 * qual exercício ocupa a posição. Com troca pendente, o exercício original
 * recebe o risco de caneta e o novo nome entra no lugar, com desfazer ao lado.
 */
export default function ExerciseSwapRow({
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

  return (
    <li
      className={cn(
        "border-b border-border py-5",
        changed && "border-l-[3px] border-l-primary pl-4",
      )}
    >
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        {/* A posição é uma sequência de verdade (a ordem do treino), então o
            número numerado se justifica aqui. */}
        <span className="w-7 shrink-0 pt-1.5 text-sm text-muted-foreground ficha-mono">
          {String(workoutExercise.order).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground ficha-label">
            {current?.muscle_group?.name || "Sem grupo muscular"}
          </p>

          <h3 className="mt-2 break-words text-[clamp(1.125rem,4.5vw,1.5rem)] ficha-display">
            {current?.name || "—"}
          </h3>

          {changed ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No lugar de{" "}
              <span className="relative inline-block">
                {original?.name || "—"}
                {/* Risco de caneta: a marca de mão do sistema, não cor. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-1 -right-1 top-1/2 h-[2px] origin-left -rotate-[1.2deg] bg-muted-foreground animate-strike"
                />
              </span>
            </p>
          ) : null}

          <p className="mt-3 text-muted-foreground ficha-label">
            {prescriptionLine(series)}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-5 sm:w-auto">
          {changed ? (
            <button
              type="button"
              onClick={onUndo}
              disabled={disabled}
              className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
            >
              Desfazer
            </button>
          ) : null}

          <button
            type="button"
            onClick={onSwap}
            disabled={disabled}
            className="min-h-11 border-2 border-foreground px-6 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ficha-mono hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40"
          >
            Trocar
          </button>
        </div>
      </div>
    </li>
  );
}
