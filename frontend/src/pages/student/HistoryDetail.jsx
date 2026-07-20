import { ArrowLeft, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ErrorState from "../../components/loading/ErrorState";
import ListSkeleton from "../../components/loading/ListSkeleton";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadCheckin = () => {
    let active = true;

    setLoading(true);
    setError(false);

    workoutCheckinsService
      .getById(id)
      .then((data) => {
        if (active) setCheckin(data);
      })
      .catch(() => {
        if (active) {
          setError(true);
          toast.error("Não foi possível carregar o check-in.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => loadCheckin(), [id]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Histórico"
          title={checkin?.workout?.name || "Check-in"}
          description={
            checkin ? `Realizado em ${formatDate(checkin.performed_at)}` : ""
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate("/student/history")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao histórico
          </Button>

          {checkin?.workout_id ? (
            <Button
              onClick={() =>
                navigate(
                  `/student/workout/${checkin.workout_id}?checkin_id=${checkin.id}`,
                )
              }
            >
              <PenLine className="h-4 w-4" />
              Editar check-in
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <ListSkeleton count={4} columns="md:grid-cols-2" lines={4} />
      ) : error ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent>
            <ErrorState onRetry={loadCheckin} />
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
          {checkin.notes ? (
            <Card className="border-border/80 bg-card/80">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-foreground">
                  Observações gerais
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {checkin.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {(checkin.exercises || []).map((item) => (
              <Card key={item.id} className="border-border/80 bg-card/80">
                <CardContent className="space-y-3 p-5">
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

                  <div className="space-y-2">
                    {(item.sets || []).map((set) => (
                      <div
                        key={set.id}
                        className="rounded-lg border border-border/60 bg-background/40 p-3"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          Série {set.set_number}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Carga</p>
                            <p className="font-semibold text-foreground">
                              {set.performed_weight ?? "-"} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Repetições</p>
                            <p className="font-semibold text-foreground">
                              {set.performed_repetitions ?? "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Descanso</p>
                            <p className="font-semibold text-foreground">
                              {set.performed_rest_time ?? "-"} s
                            </p>
                          </div>
                        </div>

                        {set.notes ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {set.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
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
