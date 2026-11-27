import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Repeat2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import Spinner from "../../components/common/Spinner";
import TapeDivider from "../../components/ficha/TapeDivider";
import ErrorState from "../../components/loading/ErrorState";
import { Dialog, DialogCloseButton } from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import workoutsService from "../../services/WorkoutsService";
import ExercisePicker from "../trainer/Workouts/components/ExercisePicker";
import ExerciseSwapRow from "./components/workout/ExerciseSwapRow";

const LINK =
  "min-h-11 text-[11px] font-semibold uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ficha-mono";

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
 *
 * No tema "A Ficha": a prescrição é a folha do personal e o aluno só troca a
 * peça de cada linha. Salvar é a única Anilha da tela.
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
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="border-b-2 border-foreground pb-6 pt-8">
          <button
            type="button"
            onClick={() => navigate("/student/my-workouts")}
            className={cn(LINK, "text-muted-foreground hover:text-foreground")}
          >
            ← A prancheta
          </button>

          <p className="mt-5 text-muted-foreground ficha-label">
            Troca de exercícios
          </p>

          <h1 className="mt-4 text-[clamp(2.25rem,5.5vw,3.75rem)] ficha-display">
            {workout?.name || "Editar treino"}
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            A estrutura não muda: o exercício que entrar assume as mesmas séries
            e a mesma prescrição da posição.
          </p>

          <button
            type="button"
            onClick={() => navigate(`/student/manage-workouts/${id}/edit`)}
            className={cn(LINK, "mt-3 block hover:text-primary")}
          >
            Mudar séries, ordem ou adicionar exercícios
          </button>
        </div>

        {isLoading ? (
          <div aria-hidden="true" className="mt-10 border-t border-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex h-28 flex-col justify-center gap-3.5 border-b border-border"
              >
                <span className="block h-5 w-56 animate-pulse bg-muted" />
                <span className="block h-3 w-72 animate-pulse bg-muted" />
              </div>
            ))}
          </div>
        ) : notFound ? (
          <div className="mt-10">
            <TapeDivider className="mb-7" />
            <p className="text-[19px] font-medium">
              Este treino não está mais disponível
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ele pode ter sido desativado ou removido pelo seu personal.
            </p>
          </div>
        ) : isError ? (
          <div className="mt-10 border-2 border-border bg-card p-6">
            <ErrorState onRetry={refetch} />
          </div>
        ) : exercises.length === 0 ? (
          <div className="mt-10">
            <TapeDivider className="mb-7" />
            <p className="text-[19px] font-medium">
              Este treino ainda não tem exercícios
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Não há nada para trocar aqui — mas você pode montar o treino você
              mesmo.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/student/manage-workouts/${id}/edit`)}
              className="mt-5 min-h-12 border-2 border-foreground px-6 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ficha-mono hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Adicionar exercícios
            </button>
          </div>
        ) : (
          <>
            <ul className="mt-10 border-t border-border">
              {exercises.map((workoutExercise) => (
                <ExerciseSwapRow
                  key={workoutExercise.id}
                  workoutExercise={workoutExercise}
                  selectedExercise={swaps[workoutExercise.id]}
                  disabled={saving}
                  onSwap={() => setPickerFor(workoutExercise)}
                  onUndo={() => handleUndo(workoutExercise.id)}
                />
              ))}
            </ul>

            <div className="sticky bottom-4 mt-8 flex flex-col gap-4 border-2 border-foreground bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground ficha-label">
                {changes.length === 0
                  ? "Nenhuma troca pendente"
                  : `${changes.length} ${
                      changes.length === 1
                        ? "posição trocada"
                        : "posições trocadas"
                    }`}
              </p>

              <button
                type="button"
                onClick={handleSave}
                disabled={changes.length === 0 || saving}
                className="flex min-h-12 items-center justify-center gap-3 border-2 border-foreground bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors duration-200 ficha-mono ficha-wipe hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:border-input disabled:bg-transparent disabled:text-muted-foreground"
              >
                {saving ? <Spinner className="h-4 w-4" /> : null}
                Salvar trocas
              </button>
            </div>
          </>
        )}

        <Dialog
          open={Boolean(pickerFor)}
          onClose={() => setPickerFor(null)}
          className="max-w-xl"
        >
          <DialogCloseButton onClick={() => setPickerFor(null)} />

          <div className="border-b border-border px-6 py-5">
            <p className="text-muted-foreground ficha-label">
              Posição {String(pickerFor?.order ?? "").padStart(2, "0")} ·{" "}
              {pickerFor?.exercise?.name || "exercício atual"}
            </p>
            <h2 className="mt-2.5 text-[1.75rem] ficha-display">
              Trocar exercício
            </h2>
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
