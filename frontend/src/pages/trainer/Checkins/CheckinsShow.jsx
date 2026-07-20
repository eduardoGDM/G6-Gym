import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
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

  const { data: checkin, isLoading, isError } = useQuery({
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
          <CardContent className="py-4">
            <PageLoader label="Carregando check-in..." />
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

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border/70">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Série
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Carga planejada
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Carga realizada
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Reps. planejadas
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Reps. realizadas
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Descanso planejado
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Descanso realizado
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                            Observação
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-card/70">
                        {(item.sets || []).map((set) => (
                          <tr key={set.id}>
                            <td className="px-3 py-2 text-sm font-medium text-foreground">
                              {displayValue(set.set_number)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.planned_weight)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.performed_weight)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.planned_repetitions)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.performed_repetitions)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.planned_rest_time)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.performed_rest_time)}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {displayValue(set.notes)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
