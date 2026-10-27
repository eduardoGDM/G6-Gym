import { CirclePlay, Dumbbell, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePendingWorkout } from "../../hooks/usePendingWorkout";
import { formatDate } from "../../lib/format";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

const SESSION_KEY = "pending-workout-modal:dismissed";

/**
 * Check-ins já dispensados nesta sessão do navegador.
 *
 * Guardamos o id em sessionStorage (não localStorage) justamente para que a
 * modal volte no próximo login: a sessão morre quando a aba fecha. Guardar o id,
 * e não um booleano, faz uma pendência diferente ainda aparecer depois de o
 * aluno dispensar a primeira.
 */
const readDismissed = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistDismissed = (ids) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage indisponível (aba privada/bloqueada): a modal volta a
    // aparecer na próxima navegação, mas nada quebra.
  }
};

/**
 * Data local (não UTC) deslocada em dias: `performed_at` é gravado a partir do
 * fuso do aluno, então comparar com toISOString() erraria o dia à noite.
 */
const localDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const describeDate = (performedAt) => {
  const date = String(performedAt || "").slice(0, 10);

  if (date === localDate()) return "iniciado hoje";
  if (date === localDate(-1)) return "iniciado ontem";

  return `iniciado em ${formatDate(date)}`;
};

/**
 * Modal de retomada de treino, exibida ao entrar no sistema quando existe um
 * treino iniciado e não finalizado (ver usePendingWorkout).
 *
 * O botão leva para a página do treino com `checkin_id` na URL: sem ele, uma
 * pendência de ontem abriria um check-in novo de hoje em vez de retomar o que
 * ficou pela metade.
 */
export default function PendingWorkoutModal() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(readDismissed);

  const { data: checkin } = usePendingWorkout();

  // Na própria tela de treino o aviso seria ruído: o aluno já está onde a modal
  // levaria. Não marcamos como dispensada — se ele sair sem concluir, o aviso
  // ainda aparece.
  const onWorkoutScreen = pathname.startsWith("/student/workout");

  const open =
    Boolean(checkin) && !onWorkoutScreen && !dismissed.includes(checkin.id);

  if (!open) return null;

  const handleDismiss = () => {
    const next = [...dismissed, checkin.id];
    persistDismissed(next);
    setDismissed(next);
  };

  const handleGo = () => {
    handleDismiss();
    navigate(
      `/student/workout/${checkin.workout_id}?checkin_id=${checkin.id}`,
    );
  };

  return (
    <Dialog open onClose={handleDismiss} className="max-w-md">
      <div className="flex flex-col items-center gap-3 border-b border-border/80 px-6 py-7 text-center sm:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary animate-in zoom-in-50 duration-300">
          <TriangleAlert className="h-8 w-8" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Você tem um treino em andamento
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Este treino foi iniciado e não chegou a ser concluído. Retome de onde
            parou — o progresso que você já registrou está salvo.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8">
        <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-surface p-4 pl-5">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-primary"
          />

          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
            >
              <Dumbbell className="h-4.5 w-4.5" />
            </span>

            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {checkin.workout?.name || "Treino"}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {describeDate(checkin.performed_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
        <Button variant="outline" onClick={handleDismiss}>
          Depois
        </Button>
        <Button onClick={handleGo}>
          <CirclePlay className="h-4 w-4" aria-hidden="true" />
          Ir ao treino
        </Button>
      </div>
    </Dialog>
  );
}
