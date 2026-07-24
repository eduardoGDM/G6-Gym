import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Dumbbell, Play } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ErrorState from "../../components/loading/ErrorState";
import ListSkeleton from "../../components/loading/ListSkeleton";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import workoutsService from "../../services/WorkoutsService";

/**
 * Quantos grupos musculares aparecem antes de virar "+N". Passar de três chips
 * numa linha começa a competir com o nome do treino pela atenção.
 */
const VISIBLE_MUSCLE_GROUPS = 3;

function getMuscleGroups(workout) {
  const names = (workout.workout_exercises || [])
    .map((item) => item.exercise?.muscle_group?.name)
    .filter(Boolean);

  return [...new Set(names)];
}

/**
 * Card de treino do aluno.
 *
 * O card inteiro é a ação: um botão em overlay cobre a superfície e o círculo
 * de play é apenas o indicador visual dela (aria-hidden). Isso mantém um único
 * ponto de foco por card e evita elemento interativo dentro de elemento
 * interativo — o botão vermelho de largura total dava a mesma função dominando
 * o layout.
 */
function WorkoutCard({ workout, onStart }) {
  const muscleGroups = getMuscleGroups(workout);
  const exerciseCount = workout.workout_exercises?.length || 0;
  const visibleGroups = muscleGroups.slice(0, VISIBLE_MUSCLE_GROUPS);
  const hiddenGroups = muscleGroups.length - visibleGroups.length;

  return (
    <Card
      className={[
        "group relative flex flex-col rounded-2xl border-border/60 bg-card p-5",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-popover",
        "focus-within:border-border focus-within:shadow-popover",
        "active:translate-y-0",
        "motion-reduce:transform-none motion-reduce:transition-none",
      ].join(" ")}
    >
      {/* Superfície clicável do card. Fica sobre o conteúdo para que qualquer
          ponto inicie o treino, mantendo um só elemento focável. */}
      <button
        type="button"
        onClick={onStart}
        aria-label={`Iniciar treino: ${workout.name}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
          >
            <Dumbbell className="h-[18px] w-[18px]" />
          </span>

          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground"
              title={workout.name}
            >
              {workout.name}
            </h3>

            {workout.description ? (
              <p
                className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground"
                title={workout.description}
              >
                {workout.description}
              </p>
            ) : null}

            <p className="mt-1.5 text-xs text-muted-foreground">
              {exerciseCount} {exerciseCount === 1 ? "exercício" : "exercícios"}
              {muscleGroups.length > 0 ? (
                <>
                  <span aria-hidden="true" className="mx-1.5 text-border">
                    ·
                  </span>
                  {muscleGroups.length}{" "}
                  {muscleGroups.length === 1 ? "grupo" : "grupos"}
                </>
              ) : null}
            </p>
          </div>

          <span
            aria-hidden="true"
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              "bg-primary/10 text-primary ring-1 ring-primary/20",
              "transition-[background-color,color,transform,box-shadow] duration-200 ease-out",
              "group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary",
              "group-hover:scale-105 group-hover:shadow-subtle",
              "group-focus-within:bg-primary group-focus-within:text-primary-foreground",
              "motion-reduce:transform-none motion-reduce:transition-none",
            ].join(" ")}
          >
            <Play className="h-[18px] w-[18px] translate-x-[1px] fill-current" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3.5">
          {visibleGroups.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Nenhum grupo muscular definido
            </span>
          ) : (
            <>
              {visibleGroups.map((name) => (
                <Badge
                  key={name}
                  variant="outline"
                  className="border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {name}
                </Badge>
              ))}

              {hiddenGroups > 0 ? (
                <span
                  className="text-[11px] font-medium text-muted-foreground/80"
                  title={muscleGroups.slice(VISIBLE_MUSCLE_GROUPS).join(", ")}
                >
                  +{hiddenGroups}
                </span>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyWorkouts() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-workouts"],
    queryFn: () => workoutsService.getMyWorkouts(),
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar seus treinos.");
    }
  }, [isError]);

  const workouts = data || [];

  return (
    <PageContainer>
      <PageTitle
        eyebrow="Meus dados"
        title="Meus treinos"
        description="Veja aqui os treinos ativos atribuídos para você e inicie o check-in."
      />

      {isLoading ? (
        <ListSkeleton count={6} columns="md:grid-cols-2 xl:grid-cols-3" lines={2} />
      ) : isError ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent>
            <ErrorState onRetry={refetch} />
          </CardContent>
        </Card>
      ) : workouts.length === 0 ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Nenhum treino disponível no momento</p>
              <p className="text-sm text-muted-foreground">
                Quando seu trainer publicar um treino, ele vai aparecer aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onStart={() => navigate(`/student/workout/${workout.id}`)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
