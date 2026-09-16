import { Check, CloudOff, Loader2, Save, TriangleAlert } from "lucide-react";
import { useWatch } from "react-hook-form";

import Spinner from "../../../../components/common/Spinner";
import { Button } from "../../../../components/ui/button";
import { AUTOSAVE_STATUS } from "../../../../hooks/useCheckinAutosave";
import { cn } from "../../../../lib/utils";
import { countSets } from "../../utils/workoutCheckin";

const AUTOSAVE_INDICATOR = {
  [AUTOSAVE_STATUS.PENDING]: {
    icon: Loader2,
    label: "Alterações não salvas…",
    className: "text-muted-foreground",
  },
  [AUTOSAVE_STATUS.SAVING]: {
    icon: Loader2,
    label: "Salvando…",
    className: "text-muted-foreground",
    spin: true,
  },
  [AUTOSAVE_STATUS.SAVED]: {
    icon: Check,
    label: "Salvo automaticamente",
    className: "text-success",
  },
  [AUTOSAVE_STATUS.OFFLINE]: {
    icon: CloudOff,
    label: "Sem conexão. Tentaremos de novo.",
    className: "text-warning",
  },
  [AUTOSAVE_STATUS.ERROR]: {
    icon: TriangleAlert,
    label: "Erro ao salvar",
    className: "text-destructive",
  },
};

function AutosaveIndicator({ status }) {
  const config = AUTOSAVE_INDICATOR[status];

  return (
    <p
      className={cn(
        "flex min-h-4 items-center gap-1.5 truncate text-xs font-medium",
        config?.className,
      )}
      role="status"
      aria-live="polite"
    >
      {config ? (
        <>
          <config.icon
            aria-hidden="true"
            className={cn("h-3.5 w-3.5 shrink-0", config.spin && "animate-spin")}
          />
          <span className="truncate">{config.label}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * Barra fixa no rodapé do treino: progresso de séries feitas, status do
 * salvamento automático e o botão de concluir — sempre à vista durante a rolagem.
 */
export default function WorkoutProgressFooter({
  control,
  autosaveStatus,
  submitting,
}) {
  const exercises = useWatch({ control, name: "exercises" });
  const { done, total } = countSets(exercises);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-background px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:rounded-xl sm:border sm:bg-card sm:px-5">
      <div
        className="mb-3 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Séries feitas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-300",
            allDone ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-mono text-lg font-bold leading-none tabular-nums",
                allDone ? "text-success" : "text-foreground",
              )}
            >
              {done}/{total}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              séries
            </span>
          </p>
          <AutosaveIndicator status={autosaveStatus} />
        </div>

        <Button
          type="submit"
          variant={allDone ? "success" : "default"}
          disabled={submitting || autosaveStatus === AUTOSAVE_STATUS.SAVING}
        >
          {submitting ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {submitting ? "Salvando..." : "Concluir treino"}
        </Button>
      </div>
    </div>
  );
}
