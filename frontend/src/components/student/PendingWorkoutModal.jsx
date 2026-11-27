import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePendingWorkout } from "../../hooks/usePendingWorkout";
import { formatDate } from "../../lib/format";
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

  if (date === localDate()) return "Iniciado hoje";
  if (date === localDate(-1)) return "Iniciado ontem";

  return `Iniciado em ${formatDate(date)}`;
};

/**
 * Modal de retomada de treino, exibida ao entrar no sistema quando existe um
 * treino iniciado e não finalizado (ver usePendingWorkout).
 *
 * O botão leva para a página do treino com `checkin_id` na URL: sem ele, uma
 * pendência de ontem abriria um check-in novo de hoje em vez de retomar o que
 * ficou pela metade.
 *
 * No tema "A Ficha" é a ficha que ficou aberta na prancheta: fita de piso no
 * topo, o nome do treino na display e uma única Anilha — retomar.
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
    navigate(`/student/workout/${checkin.workout_id}?checkin_id=${checkin.id}`);
  };

  return (
    <Dialog
      open
      onClose={handleDismiss}
      className="max-w-md rounded-none border-2 border-foreground"
    >
      {/* Fita de demarcação: a marcação de "atenção" do sistema, sem ícone de
          alerta nem caixa colorida. */}
      <div aria-hidden="true" className="h-[7px] ficha-tape" />

      <div className="px-6 pb-6 pt-7 sm:px-8">
        <p className="text-muted-foreground ficha-label">Treino em andamento</p>

        <h2 className="mt-4 text-[clamp(1.875rem,6vw,2.5rem)] ficha-display">
          {checkin.workout?.name || "Treino"}
        </h2>

        <p className="mt-4 text-[13px] uppercase tracking-[0.16em] ficha-mono">
          {describeDate(checkin.performed_at)}
          <span className="text-muted-foreground"> — não concluído</span>
        </p>

        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
          O que você já registrou está salvo. Retome de onde parou.
        </p>

        <button
          type="button"
          onClick={handleGo}
          className="mt-7 flex min-h-14 w-full items-center justify-between gap-6 border-2 border-foreground bg-primary px-5 text-primary-foreground transition-colors duration-200 ficha-wipe hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] ficha-mono">
            Retomar o treino
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 min-h-12 w-full text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Depois
        </button>
      </div>
    </Dialog>
  );
}
