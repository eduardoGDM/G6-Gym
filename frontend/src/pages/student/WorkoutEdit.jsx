import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Info, Repeat2, Save, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/loading/ErrorState";
import ListSkeleton from "../../components/loading/ListSkeleton";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogCloseButton } from "../../components/ui/dialog";
import workoutsService from "../../services/WorkoutsService";
import ExercisePicker from "../trainer/Workouts/components/ExercisePicker";
import ExerciseSwapCard from "./components/workout/ExerciseSwapCard";

/**
 * Troca de exercícios de um treino do aluno — o caminho rápido e conservador.
 *
 * Só a escolha do exercício de cada posição é editável: séries, repetições,
 * carga, RIR, descanso e técnica avançada continuam como o personal prescreveu
 * (a API altera apenas workout_exercises.exercise_id). Por isso a tela não usa
 * React Hook Form — não há campo digitável nem validação de formulário, o
 * estado é a seleção pendente de cada posição.
 *
 * Para mudar a estrutura (adicionar, remover, reordenar ou mexer nas séries) o
 * aluno usa a montagem completa em /student/manage-workouts/:id/edit, que
 * reaproveita o formulário do personal. As duas telas convivem porque o update
 * de lá apaga e recria os workout_exercises, enquanto aqui a prescrição é
 * preservada posição por posição.
 */
export default function WorkoutEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // { [workout_exercise_id]: exercício escolhido } — só as posições alteradas.
  const [swaps, setSwaps] = useState({});
  const [pickerFor, setPickerFor] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: workout, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-workout", id],
    queryFn: () => workoutsService.getWorkout(id),
    retry: false,
  });

  const notFound = error?.response?.status === 404;

  const exercises = useMemo(
    () =>
      [...(workout?.workout_exercises || [])].sort((a, b) => a.order - b.order),
    [workout],
  );

  // Composição final (posições trocadas + intactas): alimenta o picker para
  // impedir exercício repetido, que a API também recusa.
  const composedExerciseIds = exercises.map(
    (item) => swaps[item.id]?.id ?? item.exercise_id,
  );

  const changes = Object.entries(swaps).map(([workoutExerciseId, exercise]) => ({
    workout_exercise_id: Number(workoutExerciseId),
    exercise_id: exercise.id,
  }));

  const handleSelect = (exercise) => {
    const target = pickerFor;
    setPickerFor(null);

    setSwaps((current) => {
      const next = { ...current };

      // Voltar ao exercício original não é uma alteração a enviar.
      if (Number(exercise.id) === Number(target.exercise_id)) {
        delete next[target.id];
        return next;
      }

      next[target.id] = exercise;
      return next;
    });
  };

  const handleUndo = (workoutExerciseId) => {
    setSwaps((current) => {
      const next = { ...current };
      delete next[workoutExerciseId];
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await crudToast(workoutsService.updateWorkoutExercises(id, changes), {
        action: "update",
        entity: "Treino",
      });

      // A lista de treinos e o cache deste treino mostram os nomes antigos até
      // serem revalidados.
      queryClient.invalidateQueries({ queryKey: ["student-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["student-workout", id] });

      navigate("/student/my-workouts");
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <PageTitle
            eyebrow="Meus treinos"
            title={workout?.name || "Editar treino"}
            description="Troque os exercícios do treino mantendo a prescrição. As séries, repetições, cargas e descansos continuam como estão."
          />

          <Button
            variant="outline"
            size="sm"
            className="mt-8 shrink-0"
            onClick={() => navigate("/student/my-workouts")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton count={4} columns="" lines={3} />
        ) : notFound ? (
          <Card className="border-border/80 bg-card/80">
            <CardContent className="p-6">
              <p className="font-semibold">Este treino não está mais disponível</p>
              <p className="text-sm text-muted-foreground">
                Ele pode ter sido desativado ou removido pelo seu personal
                trainer.
              </p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-border/80 bg-card/80">
            <CardContent>
              <ErrorState onRetry={refetch} />
            </CardContent>
          </Card>
        ) : exercises.length === 0 ? (
          <Card className="border-border/80 bg-card/80">
            <CardContent className="p-6">
              <p className="font-semibold">
                Este treino ainda não possui exercícios
              </p>
              <p className="text-sm text-muted-foreground">
                Não há nada para trocar aqui — mas você pode montar o treino
                você mesmo.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/student/manage-workouts/${id}/edit`)}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Adicionar exercícios
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-border/70 bg-surface/60 p-3.5 text-sm text-muted-foreground">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p>
                  A estrutura do treino não muda: ao trocar um exercício, ele
                  assume as mesmas séries e a mesma prescrição da posição.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/student/manage-workouts/${id}/edit`)}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Mudar séries, ordem ou adicionar exercícios
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {exercises.map((workoutExercise) => (
                <ExerciseSwapCard
                  key={workoutExercise.id}
                  workoutExercise={workoutExercise}
                  selectedExercise={swaps[workoutExercise.id]}
                  disabled={saving}
                  onSwap={() => setPickerFor(workoutExercise)}
                  onUndo={() => handleUndo(workoutExercise.id)}
                />
              ))}
            </div>

            <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-popover backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {changes.length === 0
                  ? "Nenhum exercício alterado."
                  : `${changes.length} ${
                      changes.length === 1
                        ? "exercício alterado"
                        : "exercícios alterados"
                    }.`}
              </p>

              <Button
                type="button"
                onClick={handleSave}
                disabled={changes.length === 0 || saving}
              >
                {saving ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Salvar alterações
              </Button>
            </div>
          </>
        )}

        <Dialog
          open={Boolean(pickerFor)}
          onClose={() => setPickerFor(null)}
          className="max-w-xl"
        >
          <DialogCloseButton onClick={() => setPickerFor(null)} />

          <div className="border-b border-border/80 px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Trocar exercício
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Posição {pickerFor?.order} ·{" "}
              {pickerFor?.exercise?.name || "exercício atual"}
            </p>
          </div>

          <div className="px-6 py-5">
            <ExercisePicker
              scope="student"
              addedIds={composedExerciseIds}
              onAdd={handleSelect}
              actionIcon={Repeat2}
              actionLabel="Trocar"
              addedLabel="No treino"
            />
          </div>
        </Dialog>
      </div>
    </PageContainer>
  );
}
