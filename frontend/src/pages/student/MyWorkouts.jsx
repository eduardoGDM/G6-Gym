import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Dumbbell, PlayCircle } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageLoader from "../../components/common/PageLoader";
import PageTitle from "../../components/common/PageTitle";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import workoutsService from "../../services/WorkoutsService";

function getMuscleGroups(workout) {
  const names = (workout.workout_exercises || [])
    .map((item) => item.exercise?.muscle_group?.name)
    .filter(Boolean);

  return [...new Set(names)];
}

export default function MyWorkouts() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
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
        <Card className="border-border/80 bg-card/80">
          <CardContent className="py-4">
            <PageLoader label="Carregando treinos..." />
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
          {workouts.map((workout) => {
            const muscleGroups = getMuscleGroups(workout);
            const exerciseCount = workout.workout_exercises?.length || 0;

            return (
              <Card
                key={workout.id}
                className="flex flex-col border-border/80 bg-card/80"
              >
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      {workout.name}
                    </p>
                    {workout.description ? (
                      <p className="text-sm text-muted-foreground">
                        {workout.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Nenhum grupo muscular definido
                      </span>
                    ) : (
                      muscleGroups.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {exerciseCount}{" "}
                    {exerciseCount === 1 ? "exercício" : "exercícios"}
                  </p>

                  <Button
                    className="mt-auto w-full"
                    onClick={() => navigate(`/student/workout/${workout.id}`)}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Iniciar Treino
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
