import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PenLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import ActionIconButton from "../../components/common/ActionIconButton";
import CheckinComments from "../../components/checkins/CheckinComments";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ErrorState from "../../components/loading/ErrorState";
import ListSkeleton from "../../components/loading/ListSkeleton";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";
import { formatDate } from "../../lib/format";

// A exclusão é definitiva e o check-in alimenta histórico, evolução e streak —
// por isso o aluno revalida tudo que perde antes de confirmar.
const AFFECTED_QUERY_KEYS = [
  ["student-history"],
  ["student-dashboard-summary"],
  ["student-dashboard-recent-workouts"],
  ["student-dashboard-evolution"],
  ["student-gamification-summary"],
  ["exercise-history"],
];

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const confirmDelete = useConfirmDialog();

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

  const runDelete = async (checkinId) => {
    try {
      await crudToast(workoutCheckinsService.remove(checkinId), {
        action: "delete",
        entity: "Check-in",
      });

      await Promise.all(
        AFFECTED_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );

      navigate("/student/history");
    } catch {
      // erro já exibido pelo crudToast
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4">
        <PageTitle
          eyebrow="Histórico"
          title={checkin?.workout?.name || "Check-in"}
          description={
            checkin ? `Realizado em ${formatDate(checkin.performed_at)}` : ""
          }
        />

        {/* Barra de ações compacta: ícones agrupados num painel, cor apenas como
            marcação de intenção (editar = marca, excluir = destrutivo). */}
        <div className="flex w-fit shrink-0 items-center gap-0.5 self-start rounded-xl border border-border/70 bg-card/60 p-1 shadow-subtle">
          <ActionIconButton
            icon={ArrowLeft}
            tooltip="Voltar ao histórico"
            color="ghost"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/student/history")}
          />

          {checkin?.workout_id ? (
            <ActionIconButton
              icon={PenLine}
              tooltip="Editar check-in"
              color="ghost"
              className="h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() =>
                navigate(
                  `/student/workout/${checkin.workout_id}?checkin_id=${checkin.id}`,
                )
              }
            />
          ) : null}

          {checkin ? (
            <>
              <span
                aria-hidden="true"
                className="mx-0.5 h-5 w-px bg-border/70"
              />
              <ActionIconButton
                icon={Trash2}
                tooltip="Excluir check-in"
                color="ghost"
                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => confirmDelete.request(checkin.id)}
                loading={confirmDelete.loading}
              />
            </>
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
          <CheckinComments comments={checkin.comments || []} readOnly />

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
                          {set.performed_rest_time !== null &&
                          set.performed_rest_time !== undefined ? (
                            <div>
                              <p className="text-muted-foreground">Descanso</p>
                              <p className="font-semibold text-foreground">
                                {set.performed_rest_time} s
                              </p>
                            </div>
                          ) : null}
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

      <ConfirmDialog
        open={confirmDelete.open}
        title="Excluir check-in"
        description={
          checkin
            ? `Isso apaga definitivamente o check-in de ${formatDate(checkin.performed_at)}, com todos os exercícios e séries registrados. A exclusão não pode ser desfeita e seu personal deixa de ver este treino.`
            : undefined
        }
        confirmLabel="Excluir definitivamente"
        variant="destructive"
        loading={confirmDelete.loading}
        onConfirm={() => confirmDelete.confirm(runDelete)}
        onCancel={confirmDelete.cancel}
      />
    </PageContainer>
  );
}
