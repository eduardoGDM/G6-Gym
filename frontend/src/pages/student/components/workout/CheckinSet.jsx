import { Check, ChevronDown, History, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import {
  canCompleteSet,
  formatSetSummary,
  formatWeight,
  hasValue,
} from "../../utils/workoutCheckin";
import PrescriptionInfo from "./PrescriptionInfo";

const roundTo = (value, precision) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

/** Botão quadrado de −/+ : 48px de alvo, geometria reta, 2px de tinta. */
function StepButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={onClick}
      className="flex h-12 w-14 shrink-0 items-center justify-center border-2 border-foreground text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:scale-90"
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

/**
 * Campo numérico protagonista: o próprio número é o input (editável por
 * teclado), em display expandida e tabular, com o alvo prescrito como
 * placeholder gigante quando está vazio.
 *
 * A rolagem de dígito alterna entre `animate-digit` e `animate-digit-alt` em
 * vez de remontar o elemento — remontar faria o input perder o foco.
 */
function GiantField({
  id,
  field,
  fieldState,
  ghost,
  unit,
  size,
  step,
  precision,
  inputMode,
  onStep,
  stepLabels,
}) {
  const [bump, setBump] = useState(0);

  const applyStep = (direction) => {
    const raw = hasValue(field.value) ? Number(field.value) : NaN;
    const base = Number.isNaN(raw) ? 0 : raw;
    const next = String(roundTo(Math.max(0, base + direction * step), precision));

    onStep?.(field.value, next);
    field.onChange(next);
    setBump((current) => current + 1);
  };

  return (
    <>
      <div className="relative flex items-end gap-2">
        {ghost ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-1 select-none text-foreground/[0.09] ficha-display"
            style={{ fontSize: size }}
          >
            {ghost}
          </span>
        ) : null}

        <input
          id={id}
          name={field.name}
          value={field.value ?? ""}
          onChange={(event) =>
            field.onChange(
              inputMode === "decimal"
                ? event.target.value.replace(",", ".")
                : event.target.value,
            )
          }
          onBlur={field.onBlur}
          inputMode={inputMode}
          placeholder=""
          aria-invalid={fieldState.invalid || undefined}
          className={cn(
            "relative w-full min-w-0 border-0 bg-transparent p-0 text-foreground outline-none ficha-display",
            bump % 2 === 0 ? "animate-digit" : "animate-digit-alt",
            fieldState.invalid && "text-destructive",
          )}
          style={{ fontSize: size }}
        />

        {unit ? (
          <span className="relative shrink-0 pb-[0.16em] text-base font-semibold tracking-[0.08em] ficha-mono">
            {unit}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex gap-2.5">
        <StepButton
          icon={Minus}
          label={stepLabels.down}
          onClick={() => applyStep(-1)}
        />
        <StepButton
          icon={Plus}
          label={stepLabels.up}
          onClick={() => applyStep(1)}
        />
      </div>
    </>
  );
}

/**
 * Uma série do check-in.
 *
 * A série atual DOMINA a tela: carga e repetições viram números gigantes, o
 * alvo do personal aparece como placeholder esmaecido e a ação de concluir é
 * uma barra de largura total. As outras séries recuam para uma linha de pauta —
 * as feitas com o risco à mão por cima, as futuras só com o alvo.
 *
 * Tocar em qualquer linha recuada a expande para correção, sem desmarcar.
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
  onOpenHistory,
}) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const base = `exercises.${exerciseIndex}.sets.${setIndex}`;
  const [weight, repetitions] = useWatch({
    control,
    name: [`${base}.performed_weight`, `${base}.performed_repetitions`],
  });

  const setNumber = set.set_number;
  const summary = formatSetSummary(weight, repetitions);
  const target = formatSetSummary(set.planned_weight, set.planned_repetitions);
  const lastSummary = lastSet
    ? formatSetSummary(lastSet.performed_weight, lastSet.performed_repetitions)
    : null;

  // A série atual abre sozinha; qualquer outra abre quando o aluno toca nela.
  const showFull = (isCurrent && !completed) || expanded;

  // Só dá para marcar feita tendo carga e reps. Desmarcar é sempre livre.
  const markBlocked =
    !completed &&
    !canCompleteSet({
      performed_weight: weight,
      performed_repetitions: repetitions,
    });
  const blockedReason = "Informe carga e reps para marcar";

  // O histórico completo só é oferecido na série Válida: é a série que carrega
  // a progressão. Aquecimento e reconhecimento já vêm pré-preenchidos.
  const showHistory = set.planned_type === "Válida" && Boolean(onOpenHistory);

  const historyButton = showHistory ? (
    <button
      type="button"
      onClick={onOpenHistory}
      aria-label="Histórico de carga e repetições deste exercício"
      title="Histórico de carga e repetições"
      className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-primary active:scale-90"
    >
      <History className="h-4 w-4" aria-hidden="true" />
    </button>
  ) : null;

  const handleToggle = () => {
    setExpanded(false);
    onToggle(setIndex);
  };

  if (!showFull) {
    return (
      <div className="flex items-center gap-3 border-b border-border py-2">
        <span
          className={cn(
            "w-9 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] ficha-mono",
            completed ? "text-foreground" : "text-muted-foreground",
          )}
        >
          S{setNumber}
        </span>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Abrir série ${setNumber} para ajuste`}
          className="min-w-0 flex-1 py-2 text-left transition-colors hover:text-foreground"
        >
          {completed ? (
            <span className="relative inline-block text-[15px] font-medium text-muted-foreground ficha-mono">
              {summary ?? "Sem valores"}
              <span
                aria-hidden="true"
                className="absolute -left-1.5 -right-1.5 top-1/2 h-[2.5px] origin-left -rotate-[1.2deg] bg-foreground animate-strike"
              />
            </span>
          ) : (
            <span className="truncate text-[14px] text-muted-foreground ficha-mono">
              {target ? `alvo ${target}` : "sem alvo definido"}
            </span>
          )}
        </button>

        {historyButton}

        <button
          type="button"
          onClick={handleToggle}
          disabled={markBlocked}
          aria-disabled={markBlocked}
          aria-pressed={completed}
          title={markBlocked ? blockedReason : undefined}
          aria-label={
            completed
              ? `Desmarcar série ${setNumber}`
              : markBlocked
                ? `Série ${setNumber}: ${blockedReason}`
                : `Marcar série ${setNumber} como feita`
          }
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center border-2 transition-colors duration-150",
            completed
              ? "border-foreground bg-foreground text-background active:scale-90"
              : markBlocked
                ? "cursor-not-allowed border-dashed border-input text-muted-foreground/50"
                : "border-input text-muted-foreground hover:border-foreground hover:text-foreground active:scale-90",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 px-4 pb-4 pt-4 transition-colors duration-200 sm:px-5",
        isCurrent && !completed
          ? "border-foreground bg-card"
          : "border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p
          className={cn(
            "ficha-label",
            isCurrent && !completed ? "text-primary" : "text-muted-foreground",
          )}
        >
          Série {setNumber}
          {isCurrent && !completed ? " · agora" : ""}
          {completed ? " · feita" : ""}
        </p>

        <span className="flex items-center gap-1">
          {target ? (
            <span className="text-muted-foreground ficha-label">
              Alvo · {target}
            </span>
          ) : null}
          {historyButton}
        </span>
      </div>

      {lastSummary ? (
        <p className="mt-1.5 text-xs text-muted-foreground ficha-mono">
          Última vez: {lastSummary}
        </p>
      ) : null}

      {prescriptionKeys.length ? (
        <div className="mt-3">
          <PrescriptionInfo set={set} keys={prescriptionKeys} />
        </div>
      ) : null}

      <div className="mt-5">
        <Label
          htmlFor={`${base}.performed_weight`}
          className="text-muted-foreground ficha-label"
        >
          Carga
        </Label>
        <div className="mt-1.5">
          <Controller
            control={control}
            name={`${base}.performed_weight`}
            render={({ field, fieldState }) => (
              <GiantField
                id={`${base}.performed_weight`}
                field={field}
                fieldState={fieldState}
                ghost={
                  hasValue(field.value) ? null : formatWeight(set.planned_weight)
                }
                unit="kg"
                size="clamp(3.25rem, 13vw, 5.5rem)"
                step={2.5}
                precision={2}
                inputMode="decimal"
                onStep={(previous, next) =>
                  onWeightChange(setIndex, previous, next)
                }
                stepLabels={{
                  down: "Diminuir 2,5 quilos",
                  up: "Aumentar 2,5 quilos",
                }}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <Label
          htmlFor={`${base}.performed_repetitions`}
          className="text-muted-foreground ficha-label"
        >
          Repetições
        </Label>
        <div className="mt-1.5">
          <Controller
            control={control}
            name={`${base}.performed_repetitions`}
            render={({ field, fieldState }) => (
              <GiantField
                id={`${base}.performed_repetitions`}
                field={field}
                fieldState={fieldState}
                ghost={
                  hasValue(field.value)
                    ? null
                    : (set.planned_repetitions ?? null)
                }
                size="clamp(2.5rem, 9vw, 3.5rem)"
                step={1}
                precision={0}
                inputMode="numeric"
                stepLabels={{
                  down: "Diminuir uma repetição",
                  up: "Aumentar uma repetição",
                }}
              />
            )}
          />
        </div>
      </div>

      {markBlocked ? (
        <p className="mt-5 text-center text-muted-foreground ficha-label">
          {blockedReason}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        disabled={markBlocked}
        aria-disabled={markBlocked}
        aria-pressed={completed}
        title={markBlocked ? blockedReason : undefined}
        className={cn(
          "flex min-h-14 w-full items-center justify-center gap-2.5 border-2 text-sm font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ficha-mono",
          markBlocked ? "mt-2" : "mt-5",
          completed
            ? "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background active:scale-[0.99]"
            : markBlocked
              ? "cursor-not-allowed border-dashed border-input text-muted-foreground/60"
              : "border-foreground bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99]",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        {completed ? `Desmarcar série ${setNumber}` : "Marcar série feita"}
      </button>

      <button
        type="button"
        onClick={() => setDetailsOpen((open) => !open)}
        aria-expanded={detailsOpen}
        className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors ficha-mono hover:text-foreground"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            detailsOpen && "rotate-180",
          )}
        />
        {detailsOpen ? "Ocultar detalhes" : "Descanso e observação"}
      </button>

      {detailsOpen ? (
        <div className="space-y-4 animate-rise">
          <div className="space-y-1.5">
            <Label
              htmlFor={`${base}.performed_rest_time`}
              className="text-muted-foreground ficha-label"
            >
              Descanso (s)
            </Label>
            <Input
              id={`${base}.performed_rest_time`}
              type="number"
              min="0"
              inputMode="numeric"
              {...register(`${base}.performed_rest_time`)}
            />
            {set.planned_rest_time ? (
              <p className="text-xs text-muted-foreground ficha-mono">
                Meta: {set.planned_rest_time} s
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${base}.notes`}
              className="text-muted-foreground ficha-label"
            >
              Observação da série
            </Label>
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

      {expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-2 w-full py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors ficha-mono hover:text-foreground"
        >
          Fechar série
        </button>
      ) : null}
    </div>
  );
}
