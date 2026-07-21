import { CheckCircle2, Flame, Moon, X } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "../../lib/utils";
import QualityDot from "./QualityDot";

const dayLabel = (value) => `${value} ${value === 1 ? "dia" : "dias"}`;

const SLEEP_TEXT = {
  good: "Sono bom",
  attention: "Atenção ao sono",
  bad: "Sono ruim",
};

/**
 * Feedback discreto exibido ao concluir um treino. Usa react-hot-toast
 * (toast.custom) para aparecer e desaparecer automaticamente, sem bloquear a tela.
 */
export function showWorkoutFeedbackToast({ streak, sleep } = {}) {
  const current = streak?.current ?? 0;

  toast.custom(
    (t) => (
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-2xl border border-border/80 bg-card p-4 shadow-popover",
          t.visible
            ? "animate-in fade-in slide-in-from-top-2"
            : "animate-out fade-out slide-out-to-top-2",
          "duration-300",
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="flex-1 space-y-1.5">
            <p className="font-semibold text-foreground">Treino concluído</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Flame
                className={cn(
                  "h-4 w-4",
                  current > 0 ? "text-orange-500" : "text-muted-foreground/50",
                )}
              />
              {current > 0
                ? `Sequência atual: ${dayLabel(current)}`
                : "Comece sua sequência hoje!"}
            </p>
            {sleep ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Moon className="h-4 w-4" />
                Sono: <QualityDot level={sleep.level} />
                <span>{SLEEP_TEXT[sleep.level] || "—"}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration: 4500, id: "workout-feedback" },
  );
}
