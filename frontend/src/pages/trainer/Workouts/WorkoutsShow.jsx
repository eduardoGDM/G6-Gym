import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Dumbbell,
  ListOrdered,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import DetailsSkeleton from "../../../components/loading/DetailsSkeleton";
import ErrorState from "../../../components/loading/ErrorState";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import workoutsService from "../../../services/WorkoutsService";
import WorkoutExerciseSummaryCard from "./components/WorkoutExerciseSummaryCard";

// Item do resumo do treino (aluno, status, período) na barra superior.
function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function WorkoutsShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await workoutsService.getById(id);
      setWorkout(data);
    } catch {
      setError(true);
      toast.error("Não foi possível carregar o treino.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const exercises = [...(workout?.workout_exercises || [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Visualização"
          title="Detalhes do treino"
          description="Consulte todas as informações cadastradas para este treino."
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/workouts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {workout?.name || "Treino"}
          </CardTitle>
          <CardDescription>
            Informações completas registradas no cadastro.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {loading ? (
            <DetailsSkeleton blocks={2} linesPerBlock={2} />
          ) : error ? (
            <ErrorState onRetry={loadWorkout} />
          ) : !workout ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
              Treino não encontrado.
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Barra de resumo do treino */}
              <div className="grid gap-5 rounded-2xl border border-border/80 bg-background/60 p-5 sm:grid-cols-2 xl:grid-cols-4">
                <MetaItem
                  icon={UserRound}
                  label="Aluno"
                  value={workout.student_profile?.user?.name}
                />
                <MetaItem
                  icon={Dumbbell}
                  label="Status"
                  value={workout.active ? "Ativo" : "Inativo"}
                />
                <MetaItem
                  icon={CalendarDays}
                  label="Início"
                  value={workout.start_date}
                />
                <MetaItem
                  icon={CalendarCheck}
                  label="Fim"
                  value={workout.end_date}
                />
              </div>

              {workout.description ? (
                <div className="rounded-2xl border border-border/80 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    Descrição
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {workout.description}
                  </p>
                </div>
              ) : null}

              {/* Lista de exercícios */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <ListOrdered className="h-4 w-4" />
                  Exercícios ({exercises.length})
                </div>

                {exercises.length === 0 ? (
                  <p className="rounded-2xl border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
                    Nenhum exercício adicionado a este treino.
                  </p>
                ) : (
                  <>
                    {/* Cabeçalho das colunas (apenas desktop) */}
                    <div className="hidden gap-x-6 px-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:grid xl:grid-cols-12">
                      <div className="xl:col-span-3">Exercício</div>
                      <div className="xl:col-span-3">Configuração</div>
                      <div className="xl:col-span-4">Séries</div>
                      <div className="xl:col-span-2">Observações</div>
                    </div>

                    <div className="space-y-4">
                      {exercises.map((item) => (
                        <WorkoutExerciseSummaryCard key={item.id} exercise={item} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
