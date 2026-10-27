import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, History, Video } from "lucide-react";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";

import ActionIconButton from "../../../../components/common/ActionIconButton";
import TallyMarks from "../../../../components/ficha/TallyMarks";
import { Field } from "../../../../components/forms/Field";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import exerciseHistoryService from "../../../../services/ExerciseHistoryService";
import { splitPrescription } from "../../utils/workoutCheckin";
import CheckinSet from "./CheckinSet";
import PrescriptionInfo from "./PrescriptionInfo";

/**
 * Item da lista em sanfona do treino, no tema "A Ficha".
 *
 * Fechado, é uma linha de ficha: índice em mono, nome na display e o progresso
 * marcado em pauzinhos ao lado do contador. Aberto, ganha a barra de tinta à
 * esquerda e as séries — com a série atual dominando a tela (ver CheckinSet).
 *
 * Exercício concluído não fica verde: o contador vira um tique de tinta e o
 * nome recua para o cinza. Conclusão é marca, não cor.
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
        "relative scroll-mt-20 border-b border-border bg-transparent transition-colors duration-200",
        isOpen && "border-b-2 border-foreground bg-card",
      )}
    >
      {isOpen ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-primary"
        />
      ) : null}

      <button
        type="button"
        onClick={() => onToggleOpen(index)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className={cn(
          "flex w-full items-center gap-3.5 py-4 pr-2 text-left transition-colors duration-200",
          isOpen ? "pl-5" : "pl-1 hover:bg-foreground/5",
        )}
      >
        <span className="w-7 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground ficha-mono">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[19px] ficha-display",
              allDone && !isOpen ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {field.exercise_name}
          </span>
          {field.muscle_group ? (
            <span className="mt-1 block truncate text-muted-foreground ficha-label">
              {field.muscle_group}
            </span>
          ) : null}
        </span>

        {doneCount > 0 ? (
          <TallyMarks
            count={doneCount}
            scale={0.42}
            animate={false}
            label={`${doneCount} de ${total} séries feitas`}
            className="hidden shrink-0 sm:block"
          />
        ) : null}

        <span
          className="shrink-0 text-base font-semibold tabular-nums ficha-mono"
          aria-label={`${doneCount} de ${total} séries feitas`}
        >
          {allDone ? (
            <Check
              className="h-5 w-5 text-foreground"
              strokeWidth={3}
              aria-hidden="true"
            />
          ) : (
            <>
              {doneCount}
              <span className="text-muted-foreground">/{total}</span>
            </>
          )}
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
          className="space-y-4 border-t border-border py-4 pl-5 pr-3 animate-rise sm:pr-5"
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

          <div className="space-y-2.5">
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
            labelClassName="ficha-label text-muted-foreground"
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
