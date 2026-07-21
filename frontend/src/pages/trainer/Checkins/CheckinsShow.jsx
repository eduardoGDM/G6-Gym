import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import DetailsSkeleton from "../../../components/loading/DetailsSkeleton";
import ErrorState from "../../../components/loading/ErrorState";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import trainerCheckinsService from "../../../services/TrainerCheckinsService";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const displayValue = (value) => (value === null || value === undefined || value === "" ? "-" : value);

export default function CheckinsShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checkin, isLoading, isError, refetch } = useQuery({
    queryKey: ["trainer-checkin", id],
    queryFn: () => trainerCheckinsService.getById(id),
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar o check-in.");
    }
  }, [isError]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Check-ins"
          title={checkin?.workout?.name || "Detalhes do check-in"}
          description={
            checkin ? `Executado em ${formatDate(checkin.performed_at)}` : ""
          }
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/checkins/workouts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <DetailsSkeleton blocks={4} linesPerBlock={1} />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent>
            <ErrorState onRetry={refetch} />
          </CardContent>
        </Card>
      ) : !checkin ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="font-semibold">Check-in não encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-border/80 bg-card/80">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Aluno
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {checkin.student_profile?.user?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Personal
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {checkin.workout?.trainer?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Treino
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {checkin.workout?.name || "Treino removido"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Data da execução
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatDate(checkin.performed_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-foreground">
                Observações gerais
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {checkin.notes || "Nenhuma observação registrada."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {(checkin.exercises || []).map((item) => (
              <Card key={item.id} className="border-border/80 bg-card/80">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {item.exercise?.name || `Exercício #${item.exercise_id}`}
                    </p>
                    {item.exercise?.muscle_group?.name ? (
                      <Badge variant="outline">
                        {item.exercise.muscle_group.name}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/60">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow hoverable={false}>
                            <TableHead className="text-xs">Série</TableHead>
                            <TableHead className="text-xs">Carga planejada</TableHead>
                            <TableHead className="text-xs">Carga realizada</TableHead>
                            <TableHead className="text-xs">Reps. planejadas</TableHead>
                            <TableHead className="text-xs">Reps. realizadas</TableHead>
                            <TableHead className="text-xs">Descanso planejado</TableHead>
                            <TableHead className="text-xs">Descanso realizado</TableHead>
                            <TableHead className="text-xs">Observação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(item.sets || []).map((set) => (
                            <TableRow key={set.id} hoverable={false}>
                              <TableCell className="font-medium text-foreground">
                                {displayValue(set.set_number)}
                              </TableCell>
                              <TableCell>{displayValue(set.planned_weight)}</TableCell>
                              <TableCell>{displayValue(set.performed_weight)}</TableCell>
                              <TableCell>{displayValue(set.planned_repetitions)}</TableCell>
                              <TableCell>{displayValue(set.performed_repetitions)}</TableCell>
                              <TableCell>{displayValue(set.planned_rest_time)}</TableCell>
                              <TableCell>{displayValue(set.performed_rest_time)}</TableCell>
                              <TableCell>{displayValue(set.notes)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {item.notes ? (
                    <p className="text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
