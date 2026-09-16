import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { NumberStepper } from "../../../../components/ui/number-stepper";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import { formatSetSummary } from "../../utils/workoutCheckin";
import PrescriptionInfo from "./PrescriptionInfo";

function DoneButton({ completed, highlighted, setNumber, iconOnly, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={completed}
      aria-label={
        completed
          ? `Desmarcar série ${setNumber}`
          : `Marcar série ${setNumber} como feita`
      }
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 active:scale-95",
        iconOnly ? "w-10" : "px-3",
        completed
          ? "bg-success text-success-foreground hover:bg-success/90"
          : highlighted
            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
            : "border border-border text-muted-foreground hover:border-success/60 hover:text-foreground",
      )}
    >
      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
      {iconOnly ? null : "Feita"}
    </button>
  );
}

/**
 * Uma série do check-in. Pendente: carga e repetições lado a lado, com os
 * valores da prescrição esmaecidos como sugestão até o aluno marcar "Feita".
 * Concluída: vira uma linha compacta verde ("40 kg × 12"); tocar no resumo
 * reabre os campos para correção sem desmarcar a série.
 *
 * Borda vermelha = pendente (mais forte na série atual), verde = feita.
 */
export default function CheckinSet({
  exerciseIndex,
  setIndex,
  set,
  control,
  register,
  completed,
  isCurrent,
  prescriptionKeys,
  lastSet,
  onToggle,
  onWeightChange,
}) {
  const [editing, setEditing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const base = `exercises.${exerciseIndex}.sets.${setIndex}`;
  const [weight, repetitions] = useWatch({
    control,
    name: [`${base}.performed_weight`, `${base}.performed_repetitions`],
  });

  const setNumber = set.set_number;
  const lastSummary = lastSet
    ? formatSetSummary(lastSet.performed_weight, lastSet.performed_repetitions)
    : null;

  const handleToggle = () => {
    setEditing(false);
    onToggle(setIndex);
  };

  if (completed && !editing) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-success/50 bg-success/5 py-1.5 pl-3 pr-1.5 transition-colors duration-200">
        <span className="w-8 shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-success">
          S{setNumber}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Editar série ${setNumber}`}
          className="min-w-0 flex-1 truncate py-2 text-left font-mono text-sm font-semibold tabular-nums text-foreground"
        >
          {formatSetSummary(weight, repetitions) ?? "Sem valores"}
        </button>
        <DoneButton
          completed
          iconOnly
          setNumber={setNumber}
          onClick={handleToggle}
        />
      </div>
    );
  }

  const suggestionClassName = cn(
    "font-mono tabular-nums",
    !completed && "text-foreground/55",
  );

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border p-3 transition-colors duration-200",
        completed
          ? "border-success/50 bg-success/5"
          : isCurrent
            ? "border-primary bg-primary/5"
            : "border-primary/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p
            className={cn(
              "font-mono text-[11px] font-bold uppercase tracking-[0.14em]",
              completed
                ? "text-success"
                : isCurrent
                  ? "text-primary"
                  : "text-muted-foreground",
            )}
          >
            Série {setNumber}
            {isCurrent && !completed ? " · agora" : ""}
          </p>
          {lastSummary ? (
            <p className="truncate font-mono text-xs tabular-nums text-muted-foreground">
              Última: {lastSummary}
            </p>
          ) : null}
        </div>

        <DoneButton
          completed={completed}
          highlighted={isCurrent}
          setNumber={setNumber}
          onClick={handleToggle}
        />
      </div>

      {prescriptionKeys.length ? (
        <PrescriptionInfo set={set} keys={prescriptionKeys} />
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="min-w-0 space-y-1">
          <Label htmlFor={`${base}.performed_weight`} className="text-xs">
            Carga (kg)
          </Label>
          <Controller
            control={control}
            name={`${base}.performed_weight`}
            render={({ field, fieldState }) => (
              <NumberStepper
                id={`${base}.performed_weight`}
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  onWeightChange(setIndex, field.value, value);
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                step={2.5}
                min={0}
                precision={2}
                inputMode="decimal"
                buttonClassName="w-9 sm:w-11"
                inputClassName={suggestionClassName}
                aria-invalid={fieldState.invalid || undefined}
              />
            )}
          />
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor={`${base}.performed_repetitions`} className="text-xs">
            Repetições
          </Label>
          <Controller
            control={control}
            name={`${base}.performed_repetitions`}
            render={({ field, fieldState }) => (
              <NumberStepper
                id={`${base}.performed_repetitions`}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                step={1}
                min={0}
                precision={0}
                inputMode="numeric"
                buttonClassName="w-9 sm:w-11"
                inputClassName={suggestionClassName}
                aria-invalid={fieldState.invalid || undefined}
              />
            )}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((open) => !open)}
        aria-expanded={detailsOpen}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            detailsOpen && "rotate-180",
          )}
        />
        {detailsOpen ? "Ocultar detalhes" : "Descanso e observação"}
      </button>

      {detailsOpen ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${base}.performed_rest_time`}>Descanso (s)</Label>
            <Input
              id={`${base}.performed_rest_time`}
              type="number"
              min="0"
              inputMode="numeric"
              {...register(`${base}.performed_rest_time`)}
            />
            {set.planned_rest_time ? (
              <p className="text-xs text-muted-foreground">
                Meta: {set.planned_rest_time} s
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${base}.notes`}>Observação da série</Label>
            <Textarea
              id={`${base}.notes`}
              autoResize
              className="min-h-20"
              placeholder="Ex: falha muscular, diminuí a carga, dor no ombro... (opcional)"
              {...register(`${base}.notes`)}
            />
          </div>
        </div>
      ) : null}

      {completed && editing ? (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="w-full rounded-lg py-1 text-xs font-medium text-success transition-colors hover:text-foreground"
        >
          Fechar edição
        </button>
      ) : null}
    </div>
  );
}
