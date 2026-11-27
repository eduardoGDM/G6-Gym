import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import TapeDivider from "../../components/ficha/TapeDivider";
import ErrorState from "../../components/loading/ErrorState";
import { usePendingWorkout } from "../../hooks/usePendingWorkout";
import { cn } from "../../lib/utils";
import workoutsService from "../../services/WorkoutsService";
import useAuthStore from "../../store/authStore";

function getMuscleGroups(workout) {
  const names = (workout.workout_exercises || [])
    .map((item) => item.exercise?.muscle_group?.name)
    .filter(Boolean);

  return [...new Set(names)];
}

/**
 * Uma ficha na prancheta.
 *
 * O bloco inteiro é a ação: um botão em overlay cobre a superfície, então há um
 * único ponto de foco por treino e nenhum interativo dentro de interativo. Os
 * atalhos de edição ficam acima do overlay (z-20) porque levam para outra tela
 * — `onSwap` troca o exercício de cada posição mantendo a prescrição, `onEdit`
 * abre a montagem completa.
 *
 * O treino iniciado e não concluído é o único que recebe Anilha: é "onde você
 * está agora". Os demais são tinta sobre papel.
 */
function WorkoutRow({ workout, onStart, onSwap, onEdit, isPending, delay }) {
  const muscleGroups = getMuscleGroups(workout);
  const exerciseCount = workout.workout_exercises?.length || 0;

  return (
    <li
      className={cn(
        "group relative animate-rise border-b border-border",
        "transition-colors duration-200 hover:bg-foreground/5",
        isPending && "border-l-[3px] border-l-primary pl-4",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Superfície clicável. Fica sobre o conteúdo para qualquer ponto da
          ficha iniciar o treino, mantendo um só elemento focável. */}
      <button
        type="button"
        onClick={onStart}
        aria-label={`${isPending ? "Retomar" : "Iniciar"} ${workout.name}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      />

      <div className="pointer-events-none relative py-6 pr-1">
        <div className="flex items-start gap-x-8 gap-y-2">
          <div className="min-w-0 flex-1">
            {isPending ? (
              <p className="mb-2 text-primary ficha-label">
                Em andamento · retome de onde parou
              </p>
            ) : null}

            <h2
              className="text-[clamp(1.5rem,3.2vw,2.15rem)] ficha-display"
              title={workout.name}
            >
              {workout.name}
            </h2>

            {workout.description ? (
              <p
                className="mt-2.5 line-clamp-1 text-sm text-muted-foreground"
                title={workout.description}
              >
                {workout.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-end gap-2">
            <span className="text-[34px] ficha-display">{exerciseCount}</span>
            <span className="pb-1.5 text-xs text-muted-foreground ficha-mono">
              exerc.
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          {/* Grupos musculares como uma linha de ficha, não como chips. */}
          <p className="min-w-0 text-muted-foreground ficha-label">
            {muscleGroups.length > 0
              ? muscleGroups.join(" · ")
              : "Sem grupo muscular definido"}
          </p>

          <div className="flex items-center gap-6">
            {onSwap || onEdit ? (
              <div className="pointer-events-auto relative z-20 flex items-center gap-5">
                {onSwap ? (
                  <button
                    type="button"
                    onClick={onSwap}
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Trocar exercícios
                  </button>
                ) : null}

                {onEdit ? (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Editar treino
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Indicador da ação do bloco — o botão real é o overlay. */}
            <span
              aria-hidden="true"
              className={cn(
                "flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ficha-mono",
                isPending ? "text-primary" : "text-foreground",
              )}
            >
              {isPending ? "Retomar" : "Iniciar"}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * "Meus treinos" no tema "A Ficha": a prancheta.
 *
 * Cada treino é uma ficha sobre a pauta — nome na display, grupos musculares em
 * linha de micro-label e a contagem de exercícios como número tabular. Sem card
 * por item, sem ícone em caixa arredondada, sem chip: a lista é o objeto.
 */
export default function MyWorkouts() {
  const navigate = useNavigate();

  const canManageWorkouts = useAuthStore(
    (state) => state.user?.student_profile?.can_manage_workouts === true,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-workouts"],
    queryFn: () => workoutsService.getMyWorkouts(),
  });

  // Mesma consulta da modal de retomada (react-query reaproveita a resposta).
  const { data: pendingCheckin } = usePendingWorkout();

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar seus treinos.");
    }
  }, [isError]);

  const workouts = data || [];

  // Sem o checkin_id na URL, uma pendência de ontem abriria um check-in novo de
  // hoje em vez de retomar o que ficou pela metade.
  const startPath = (workout) =>
    Number(pendingCheckin?.workout_id) === Number(workout.id)
      ? `/student/workout/${workout.id}?checkin_id=${pendingCheckin.id}`
      : `/student/workout/${workout.id}`;

  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="border-b-2 border-foreground pb-6 pt-8">
        <p className="text-muted-foreground ficha-label">
          Meus treinos · fichas ativas
        </p>

        <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)] ficha-display">
          A prancheta
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {canManageWorkouts
            ? "Escolha a ficha do dia para começar o registro. Você também pode trocar exercícios ou remontar o treino."
            : "Escolha a ficha do dia para começar o registro."}
        </p>
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="mt-10 border-t border-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-[132px] flex-col justify-center gap-4 border-b border-border"
            >
              <span className="block h-7 w-64 animate-pulse bg-muted" />
              <span className="block h-3 w-40 animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-10 border-2 border-border bg-card p-6">
          <ErrorState onRetry={refetch} />
        </div>
      ) : workouts.length === 0 ? (
        <div className="mt-10">
          <TapeDivider className="mb-7" />
          <p className="text-[19px] font-medium">
            Nenhuma ficha ativa no momento
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Quando seu personal publicar um treino, ele aparece aqui pronto para
            começar.
          </p>
        </div>
      ) : (
        <ul className="mt-10 border-t border-border">
          {workouts.map((workout, index) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              delay={index * 50}
              isPending={
                Number(pendingCheckin?.workout_id) === Number(workout.id)
              }
              onStart={() => navigate(startPath(workout))}
              onSwap={
                canManageWorkouts
                  ? () => navigate(`/student/workout/${workout.id}/edit`)
                  : null
              }
              onEdit={
                canManageWorkouts
                  ? () => navigate(`/student/manage-workouts/${workout.id}/edit`)
                  : null
              }
            />
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
