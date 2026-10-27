import { Check, CloudOff, Loader2, TriangleAlert } from "lucide-react";
import { useWatch } from "react-hook-form";

import Spinner from "../../../../components/common/Spinner";
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
    className: "text-muted-foreground",
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
        "flex min-h-4 items-center gap-1.5 truncate text-[10px] uppercase tracking-[0.16em] ficha-mono",
        config?.className,
      )}
      role="status"
      aria-live="polite"
    >
      {config ? (
        <>
          <config.icon
            aria-hidden="true"
            className={cn("h-3 w-3 shrink-0", config.spin && "animate-spin")}
          />
          <span className="truncate">{config.label}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * Barra fixa no rodapé do treino: progresso de séries feitas, status do
 * salvamento automático e o botão de concluir — sempre à vista na rolagem.
 *
 * A barra de progresso é um traço de giz de borda irregular, não uma pílula
 * arredondada, e o contador usa a display expandida.
 *
 * @param {React.ReactNode} [restTimer] Cronômetro de descanso. Fica dentro do
 *   mesmo bloco fixo para não precisar de um segundo `sticky` empilhado.
 */
export default function WorkoutProgressFooter({
  control,
  autosaveStatus,
  submitting,
  restTimer,
}) {
  const exercises = useWatch({ control, name: "exercises" });
  const { done, total } = countSets(exercises);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t-2 border-foreground bg-background px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3.5 sm:mx-0 sm:px-5">
      {restTimer ? <div className="mb-4">{restTimer}</div> : null}

      <div
        className="relative mb-3.5 h-2.5 bg-muted"
        role="progressbar"
        aria-label="Séries feitas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-[width] duration-300 ficha-chalk",
            allDone ? "bg-primary" : "bg-foreground",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-2">
            <span className="text-[32px] ficha-display">
              {done}
              <span className="text-muted-foreground">/{total}</span>
            </span>
            <span className="text-muted-foreground ficha-label">séries</span>
          </p>
          <AutosaveIndicator status={autosaveStatus} />
        </div>

        <button
          type="submit"
          disabled={submitting || autosaveStatus === AUTOSAVE_STATUS.SAVING}
          className={cn(
            "flex min-h-14 shrink-0 items-center justify-center gap-2.5 border-2 border-foreground px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ficha-mono",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            allDone
              ? "bg-primary text-primary-foreground hover:bg-primary-hover"
              : "bg-transparent text-foreground hover:bg-foreground hover:text-background",
          )}
        >
          {submitting ? <Spinner className="h-4 w-4" /> : null}
          {submitting ? "Salvando" : "Concluir treino"}
        </button>
      </div>
    </div>
  );
}
