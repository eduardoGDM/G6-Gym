import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  ListOrdered,
  NotebookPen,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import workoutsService from "../../../services/WorkoutsService";

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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Aluno
                  </div>
                  <div className="space-y-3 text-sm text-foreground">
                    <p>
                      <span className="font-medium">Nome:</span>{" "}
                      {workout.student_profile?.user?.name || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {workout.active ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Período
                  </div>
                  <div className="space-y-3 text-sm text-foreground">
                    <p>
                      <span className="font-medium">Início:</span>{" "}
                      {workout.start_date || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Fim:</span>{" "}
                      {workout.end_date || "—"}
                    </p>
                  </div>
                </div>
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

              <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <ListOrdered className="h-4 w-4" />
                  Exercícios ({exercises.length})
                </div>

                {exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum exercício adicionado a este treino.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((item) => {
                      const series = [...(item.series || [])].sort(
                        (a, b) => a.order - b.order,
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-border/70 bg-background/60 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                              {item.order}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {item.exercise?.name || "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.exercise?.muscle_group?.name || "—"}
                              </p>
                            </div>
                          </div>

                          {item.notes ? (
                            <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 p-3 text-sm text-foreground">
                              <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <span>{item.notes}</span>
                            </div>
                          ) : null}

                          {series.length === 0 ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                              Nenhuma série detalhada para este exercício.
                            </p>
                          ) : (
                            <div className="mt-3 overflow-hidden rounded-xl border border-border/60">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow hoverable={false}>
                                      <TableHead className="text-xs uppercase">Série</TableHead>
                                      <TableHead className="text-xs uppercase">
                                        Repetições
                                      </TableHead>
                                      <TableHead className="text-xs uppercase">Carga</TableHead>
                                      <TableHead className="text-xs uppercase">
                                        Descanso
                                      </TableHead>
                                      <TableHead className="text-xs uppercase">RIR</TableHead>
                                      <TableHead className="text-xs uppercase">Tempo</TableHead>
                                      <TableHead className="text-xs uppercase">
                                        Cadência
                                      </TableHead>
                                      <TableHead className="text-xs uppercase">
                                        Duração
                                      </TableHead>
                                      <TableHead className="text-xs uppercase">
                                        Observação
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {series.map((set, setIndex) => (
                                      <TableRow key={set.id} hoverable={false}>
                                        <TableCell>{setIndex + 1}</TableCell>
                                        <TableCell>{set.repetitions ?? "—"}</TableCell>
                                        <TableCell>{set.weight ?? "—"}</TableCell>
                                        <TableCell>{set.rest_time ?? "—"}</TableCell>
                                        <TableCell>{set.rir ?? "—"}</TableCell>
                                        <TableCell>{set.tempo || "—"}</TableCell>
                                        <TableCell>{set.cadence || "—"}</TableCell>
                                        <TableCell>{set.duration ?? "—"}</TableCell>
                                        <TableCell>{set.notes || "—"}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
