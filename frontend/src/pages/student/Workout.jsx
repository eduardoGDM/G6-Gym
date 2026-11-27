import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Flag } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import Spinner from "../../components/common/Spinner";
import RestTimer from "../../components/ficha/RestTimer";
import TapeDivider from "../../components/ficha/TapeDivider";
import { Field } from "../../components/forms/Field";
import FormSkeleton from "../../components/loading/FormSkeleton";
import ListSkeleton from "../../components/loading/ListSkeleton";
import ExerciseHistoryModal from "../../components/student/ExerciseHistoryModal";
import WorkoutRecordsModal from "../../components/student/WorkoutRecordsModal";
import { showWorkoutFeedbackToast } from "../../components/student/workoutFeedbackToast";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  readCheckinDraft,
  useCheckinAutosave,
} from "../../hooks/useCheckinAutosave";
import { PENDING_WORKOUT_QUERY_KEY } from "../../hooks/usePendingWorkout";
import achievementsService from "../../services/AchievementsService";
import gamificationService from "../../services/GamificationService";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";
import workoutsService from "../../services/WorkoutsService";
import ExerciseAccordionItem from "./components/workout/ExerciseAccordionItem";
import WorkoutProgressFooter from "./components/workout/WorkoutProgressFooter";
import { checkinSchema, getTodayISO } from "./utils/checkinSchema";
import {
  buildCheckinPayload,
  buildExerciseDefaults,
  canCompleteSet,
  countSets,
  findNextOpenExercise,
  isExerciseDone,
  normalizeDraft,
  sameNumber,
} from "./utils/workoutCheckin";

/**
 * Primeira série marcada como feita que não tem carga e repetições, ou null.
 * Usada só como rede na finalização — ver o comentário no onSubmit.
 */
const findIncompleteCompletedSet = (exercises = []) => {
  for (const exercise of exercises) {
    for (const set of exercise?.sets || []) {
      if (set?.completed && !canCompleteSet(set)) {
        return {
          exerciseName: exercise.exercise_name || "Exercício",
          setNumber: set.set_number,
        };
      }
    }
  }

  return null;
};

export default function Workout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const checkinIdParam = searchParams.get("checkin_id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [workout, setWorkout] = useState(null);
  const [checkinId, setCheckinId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [historyExercise, setHistoryExercise] = useState(null);
  const [records, setRecords] = useState(null);
  // Sanfona: apenas um exercício aberto por vez (null = todos fechados).
  const [openIndex, setOpenIndex] = useState(null);
  const scrollToOpenRef = useRef(false);
  // Descanso em andamento: { seconds, key }. A `key` remonta o cronômetro para
  // reiniciar a contagem quando a série seguinte é marcada.
  const [rest, setRest] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(checkinSchema),
    defaultValues: {
      performed_at: getTodayISO(),
      notes: "",
      exercises: [],
    },
  });

  const { fields } = useFieldArray({ control, name: "exercises" });

  // Chave estável do rascunho local: fixa por sessão de edição, para não "mudar"
  // quando o autosave criar o check-in (ou o aluno alterar a data do treino).
  const draftId = useMemo(
    () =>
      `checkin-draft:${checkinIdParam ? `id:${checkinIdParam}` : `workout:${id}`}`,
    [checkinIdParam, id],
  );

  const buildPayload = useCallback(
    (values) => buildCheckinPayload(id, values),
    [id],
  );

  const draftToSyncRef = useRef(null);

  // Espelho do `isDirty` em ref: o autosave ignora alterações enquanto o
  // formulário está limpo, para o pré-preenchimento não criar check-in. Em
  // efeito, e não durante o render, porque o lint do projeto (regras do React
  // Compiler) proíbe escrever ref no render. O autosave tem debounce de 1,5 s,
  // então o efeito já rodou muito antes de o primeiro save ser considerado.
  const isDirtyRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const { status: autosaveStatus, saveNow } = useCheckinAutosave({
    watch,
    enabled: !loading && !notFound && Boolean(workout),
    checkinId,
    onCheckinCreated: setCheckinId,
    buildPayload,
    draftId,
    isDirtyRef,
  });

  // Rascunho local recuperado ao reabrir a página é sincronizado com a API
  // assim que o carregamento termina, sem depender de nova digitação.
  useEffect(() => {
    if (!loading && !notFound && workout && draftToSyncRef.current) {
      const draft = draftToSyncRef.current;
      draftToSyncRef.current = null;
      saveNow(draft);
    }
  }, [loading, notFound, workout, saveNow]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const workoutData = await workoutsService.getWorkout(id);
        if (!active) return;
        setWorkout(workoutData);

        let checkin = null;

        if (checkinIdParam) {
          checkin = await workoutCheckinsService.getById(checkinIdParam);
        } else {
          const todaysCheckin =
            await workoutCheckinsService.getByDate(getTodayISO());

          if (
            todaysCheckin &&
            Number(todaysCheckin.workout_id) === Number(id)
          ) {
            checkin = todaysCheckin;
          }
        }

        if (!active) return;

        setCheckinId(checkin?.id || null);

        const serverValues = {
          performed_at: checkin?.performed_at
            ? checkin.performed_at.slice(0, 10)
            : getTodayISO(),
          notes: checkin?.notes || "",
          exercises: buildExerciseDefaults(
            workoutData.workout_exercises,
            checkin,
          ),
        };

        // Rascunho local não sincronizado (fechamento inesperado ou falha de rede
        // na sessão anterior) tem prioridade sobre os dados do servidor e é
        // reenviado após o carregamento.
        const draft = normalizeDraft(readCheckinDraft(draftId));
        const initialValues = draft ?? serverValues;
        reset(initialValues);
        if (draft) draftToSyncRef.current = draft;

        // Abre direto no primeiro exercício com série pendente.
        setOpenIndex(findNextOpenExercise(initialValues.exercises));
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error("Não foi possível carregar o treino.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, checkinIdParam, reset, draftId]);

  // Ao trocar o exercício aberto por uma ação do aluno, leva o cabeçalho dele
  // para o topo — o conteúdo do exercício anterior some e a tela "pularia".
  useEffect(() => {
    if (!scrollToOpenRef.current || openIndex === null) return;
    scrollToOpenRef.current = false;

    requestAnimationFrame(() => {
      document
        .getElementById(`exercise-${openIndex}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [openIndex]);

  const handleToggleOpen = (index) => {
    scrollToOpenRef.current = true;
    setOpenIndex((current) => (current === index ? null : index));
  };

  // Pré-preenchimento de aquecimento/reconhecimento com a execução anterior.
  // `shouldDirty: false` é essencial: junto com a trava do autosave, impede que
  // abrir um exercício crie um check-in que o aluno não pediu.
  const handlePrefillSet = useCallback(
    (exerciseIndex, setIndex, values) => {
      Object.entries(values).forEach(([field, value]) => {
        setValue(
          `exercises.${exerciseIndex}.sets.${setIndex}.${field}`,
          value,
          { shouldDirty: false },
        );
      });
    },
    [setValue],
  );

  const handleToggleSet = (exerciseIndex, setIndex) => {
    const path = `exercises.${exerciseIndex}.sets.${setIndex}.completed`;
    const completed = !getValues(path);

    setValue(path, completed, { shouldDirty: true });

    // Série marcada: dispara o descanso prescrito. É só visual — o campo
    // "Descanso (s)" continua manual, para o dado gravado seguir sendo o que o
    // aluno informou. Desmarcar uma série encerra a contagem.
    if (completed) {
      const planned = Number(
        getValues(`exercises.${exerciseIndex}.sets.${setIndex}.planned_rest_time`),
      );

      setRest(planned > 0 ? { seconds: planned, key: Date.now() } : null);
    } else {
      setRest(null);
    }

    // Última série do exercício marcada: avança para o próximo pendente.
    if (completed) {
      const exercises = getValues("exercises");

      if (isExerciseDone(exercises[exerciseIndex])) {
        scrollToOpenRef.current = true;
        setOpenIndex(findNextOpenExercise(exercises, exerciseIndex));
      }
    }
  };

  // Mudou a carga de uma série: as séries seguintes ainda não feitas que tinham
  // a mesma carga acompanham. Séries com carga diferente (pirâmide) ficam como
  // estão.
  const handleWeightChange = (exerciseIndex, setIndex, previous, next) => {
    const sets = getValues(`exercises.${exerciseIndex}.sets`) || [];

    sets.forEach((set, index) => {
      if (index <= setIndex || set.completed) return;
      if (!sameNumber(set.performed_weight, previous)) return;

      setValue(`exercises.${exerciseIndex}.sets.${index}.performed_weight`, next);
    });
  };

  const submitCheckin = async (data) => {
    try {
      setSubmitting(true);

      // Finalização: é aqui que o check-in deixa de ser "em andamento" e sai do
      // destaque/modal de treino pendente (o autosave nunca manda `completed`).
      const payload = buildCheckinPayload(id, data, { completed: true });

      const request = checkinId
        ? workoutCheckinsService.update(checkinId, payload)
        : workoutCheckinsService.create(payload);

      const saved = await crudToast(request, {
        action: checkinId ? "update" : "create",
        entity: "Check-in",
      });

      // Treino concluído: tira o destaque do card e a modal de retomada.
      queryClient.invalidateQueries({ queryKey: PENDING_WORKOUT_QUERY_KEY });

      // Feedback de gamificação (streak + sono) após concluir — não bloqueia o
      // fluxo caso a chamada falhe.
      try {
        const feedback = await gamificationService.summary();
        showWorkoutFeedbackToast(feedback);
      } catch {
        // silencioso: o check-in já foi salvo com sucesso
      }

      // Conquistas (recordes pessoais) obtidas neste check-in. Se houver, a tela
      // de celebração assume e adia a navegação para o fechamento da modal.
      // Qualquer falha aqui é ignorada: o check-in já foi salvo com sucesso.
      const savedCheckinId = saved?.id ?? checkinId;

      if (savedCheckinId) {
        try {
          const achievements =
            await achievementsService.forCheckin(savedCheckinId);

          if (achievements?.length) {
            setRecords(achievements);
            return;
          }
        } catch {
          // silencioso: segue direto para a navegação
        }
      }

      navigate("/student/my-workouts");
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    // Rede: a trava fica no botão de marcar série feita (ver canCompleteSet), mas
    // um rascunho local de versão antiga chega aqui com séries concluídas e sem
    // valores — o normalizeDraft marca tudo como feito.
    const incomplete = findIncompleteCompletedSet(data.exercises);

    if (incomplete) {
      toast.error(
        `${incomplete.exerciseName}: a série ${incomplete.setNumber} está marcada como feita sem carga ou repetições.`,
      );
      return;
    }

    if (countSets(data.exercises).done === 0) {
      toast.error("Marque ao menos uma série como feita para concluir o treino.");
      return;
    }

    if (!checkinId) {
      try {
        const existing = await workoutCheckinsService.getByDate(
          data.performed_at,
        );

        if (existing) {
          setConfirmState({
            data,
            workoutName: existing.workout?.name || "outro treino",
          });
          return;
        }
      } catch {
        // se a checagem falhar, segue com o fluxo normal de criação
      }
    }

    await submitCheckin(data);
  };

  const handleConfirmDuplicate = async () => {
    const pending = confirmState;
    setConfirmState(null);
    if (pending) await submitCheckin(pending.data);
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-start justify-between gap-4 border-b-2 border-foreground pb-5 pt-7">
          <div className="min-w-0">
            <p className="text-muted-foreground ficha-label">
              {checkinId ? "Treino · editando" : "Treino"}
              {fields.length
                ? ` · ${fields.length} ${fields.length === 1 ? "exercício" : "exercícios"}`
                : ""}
            </p>
            <h1 className="mt-3 break-words text-[clamp(1.75rem,8vw,3.75rem)] ficha-display">
              {workout?.name || "Treino"}
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-1 shrink-0 rounded-none border-2 border-foreground text-[11px] uppercase tracking-[0.18em] ficha-mono"
            onClick={() => navigate("/student/my-workouts")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Button>
        </header>

        {loading ? (
          <Card className="rounded-none border-2 border-border bg-card">
            <CardContent className="space-y-8 px-6 py-6 sm:px-8">
              <FormSkeleton fields={1} columns={1} footer={false} />
              <ListSkeleton count={3} columns="" lines={4} />
            </CardContent>
          </Card>
        ) : notFound ? (
          <Card className="rounded-none border-2 border-border bg-card">
            <CardContent className="p-6">
              <p className="font-semibold">
                Este treino não está mais disponível
              </p>
              <p className="text-sm text-muted-foreground">
                Ele pode ter sido desativado ou removido pelo seu personal
                trainer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {errors.exercises?.message ? (
              <p className="mb-3 text-sm text-destructive">
                {errors.exercises.message}
              </p>
            ) : null}

            <div className="mt-2 border-t border-border">
              {fields.map((field, index) => (
                <ExerciseAccordionItem
                  key={field.id}
                  index={index}
                  field={field}
                  control={control}
                  register={register}
                  isOpen={openIndex === index}
                  checkinId={checkinId}
                  onToggleOpen={handleToggleOpen}
                  onToggleSet={handleToggleSet}
                  onWeightChange={handleWeightChange}
                  onPrefillSet={handlePrefillSet}
                  onOpenHistory={() =>
                    setHistoryExercise({
                      id: field.exercise_id,
                      name: field.exercise_name,
                      muscleGroup: field.muscle_group,
                    })
                  }
                />
              ))}
            </div>

            <section className="mt-10">
              <TapeDivider delay={120} className="mb-6" />

              <h2 className="mb-5 flex items-center gap-2 text-muted-foreground ficha-label">
                <Flag className="h-4 w-4 text-primary" aria-hidden="true" />
                Finalizar treino
              </h2>

              <div className="space-y-4">
                <Field
                  label="Data do treino"
                  htmlFor="performed_at"
                  error={errors.performed_at?.message}
                >
                  <Input
                    id="performed_at"
                    type="date"
                    max={getTodayISO()}
                    className="min-w-0 max-w-full appearance-none"
                    {...register("performed_at")}
                  />
                </Field>

                <Field label="Observações gerais" htmlFor="notes">
                  <Textarea
                    id="notes"
                    autoResize
                    placeholder="Como foi o treino? (opcional)"
                    {...register("notes")}
                  />
                </Field>
              </div>
            </section>

            <WorkoutProgressFooter
              control={control}
              autosaveStatus={autosaveStatus}
              submitting={submitting}
              restTimer={
                rest ? (
                  <RestTimer
                    key={rest.key}
                    seconds={rest.seconds}
                    onDismiss={() => setRest(null)}
                  />
                ) : null
              }
            />
          </form>
        )}

        {confirmState ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/60"
              aria-label="Fechar"
              onClick={() => setConfirmState(null)}
            />

            <Card className="relative z-50 w-full max-w-md rounded-none border-2 border-foreground bg-card">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    Já existe um treino registrado para esta data
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você já possui um check-in de{" "}
                    <strong>{confirmState.workoutName}</strong> nesta data.
                    Deseja realmente criar outro check-in para este mesmo dia?
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmState(null)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmDuplicate}
                    disabled={submitting}
                  >
                    {submitting ? <Spinner className="h-4 w-4" /> : null}
                    Criar mesmo assim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <ExerciseHistoryModal
          open={Boolean(historyExercise)}
          onClose={() => setHistoryExercise(null)}
          exerciseId={historyExercise?.id}
          exerciseName={historyExercise?.name}
          muscleGroup={historyExercise?.muscleGroup}
          excludeCheckinId={checkinId}
        />

        <WorkoutRecordsModal
          open={Boolean(records)}
          records={records || []}
          onClose={() => {
            setRecords(null);
            navigate("/student/my-workouts");
          }}
        />
      </div>
    </PageContainer>
  );
}
