import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, History, Video } from "lucide-react";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";

import ActionIconButton from "../../../../components/common/ActionIconButton";
import { Field } from "../../../../components/forms/Field";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import exerciseHistoryService from "../../../../services/ExerciseHistoryService";
import { splitPrescription } from "../../utils/workoutCheckin";
import CheckinSet from "./CheckinSet";
import PrescriptionInfo from "./PrescriptionInfo";

/**
 * Item da lista em sanfona do treino. Fechado, mostra só nome e progresso
 * ("2/4"); aberto, mostra o alvo comum, as séries e a observação do exercício.
 *
 * Cores: borda/faixa vermelha enquanto houver série pendente, verde quando todas
 * as séries foram marcadas como feitas.
 */
export default function ExerciseAccordionItem({
  index,
  field,
  control,
  register,
  isOpen,
  checkinId,
  onToggleOpen,
  onToggleSet,
  onWeightChange,
  onOpenHistory,
}) {
  const sets = useWatch({ control, name: `exercises.${index}.sets` });
  const completedFlags = (sets || field.sets || []).map((set) =>
    Boolean(set?.completed),
  );

  const total = completedFlags.length;
  const doneCount = completedFlags.filter(Boolean).length;
  const allDone = total > 0 && doneCount === total;
  const currentSetIndex = completedFlags.indexOf(false);

  const { common, perSet } = useMemo(
    () => splitPrescription(field.sets || []),
    [field.sets],
  );

  // Mesma queryKey da ExerciseHistoryModal: a última execução carregada aqui
  // já deixa a modal pronta. Só busca quando o exercício está aberto.
  const { data: history } = useQuery({
    queryKey: ["exercise-history", field.exercise_id, checkinId ?? null],
    queryFn: () =>
      exerciseHistoryService.history(field.exercise_id, {
        excludeCheckinId: checkinId,
      }),
    enabled: isOpen,
  });

  const lastSetByNumber = useMemo(
    () =>
      new Map(
        (history?.data?.[0]?.sets || []).map((set) => [set.set_number, set]),
      ),
    [history],
  );

  const bodyId = `exercise-${index}-body`;

  return (
    <section
      id={`exercise-${index}`}
      className={cn(
        "relative scroll-mt-20 overflow-hidden rounded-xl border bg-card transition-colors duration-200",
        allDone
          ? "border-success/50"
          : isOpen
            ? "border-primary/70"
            : "border-primary/25 hover:border-primary/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          allDone ? "bg-success" : "bg-primary/70",
        )}
      />

      <button
        type="button"
        onClick={() => onToggleOpen(index)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3 py-3.5 pl-5 pr-4 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums",
            allDone
              ? "bg-success/15 text-success"
              : isOpen
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
          )}
        >
          {allDone ? (
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-bold",
              allDone && !isOpen ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {field.exercise_name}
          </span>
          {field.muscle_group ? (
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {field.muscle_group}
            </span>
          ) : null}
        </span>

        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            allDone ? "text-success" : "text-muted-foreground",
          )}
          aria-label={`${doneCount} de ${total} séries feitas`}
        >
          {doneCount}/{total}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          id={bodyId}
          className="space-y-3 border-t border-border/60 py-3 pl-4 pr-3 animate-in fade-in duration-200 sm:py-4 sm:pl-6 sm:pr-5"
        >
          <div className="flex items-start justify-between gap-2">
            <PrescriptionInfo set={field.sets?.[0] || {}} keys={common} />

            <div className="ml-auto flex shrink-0 items-center gap-1">
              {field.video_url ? (
                <ActionIconButton
                  icon={Video}
                  color="ghost"
                  tooltip="Assistir demonstração do exercício"
                  onClick={() =>
                    window.open(field.video_url, "_blank", "noopener,noreferrer")
                  }
                  className="h-9 w-9"
                />
              ) : null}
              <ActionIconButton
                icon={History}
                color="ghost"
                tooltip="Histórico do exercício"
                onClick={onOpenHistory}
                className="h-9 w-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            {(field.sets || []).map((set, setIndex) => (
              <CheckinSet
                key={`${field.id}-set-${set.set_number}`}
                exerciseIndex={index}
                setIndex={setIndex}
                set={set}
                control={control}
                register={register}
                completed={completedFlags[setIndex]}
                isCurrent={setIndex === currentSetIndex}
                prescriptionKeys={perSet}
                lastSet={lastSetByNumber.get(set.set_number)}
                onToggle={(target) => onToggleSet(index, target)}
                onWeightChange={(target, previous, next) =>
                  onWeightChange(index, target, previous, next)
                }
              />
            ))}
          </div>

          <Field
            label="Observação do exercício"
            htmlFor={`exercises.${index}.notes`}
            labelClassName="text-xs"
          >
            <Textarea
              id={`exercises.${index}.notes`}
              autoResize
              placeholder="Observação geral sobre o exercício (opcional)"
              {...register(`exercises.${index}.notes`)}
            />
          </Field>
        </div>
      ) : null}
    </section>
  );
}
