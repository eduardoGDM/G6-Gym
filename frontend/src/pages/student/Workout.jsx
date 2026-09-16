import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Flag } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import Spinner from "../../components/common/Spinner";
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
  countSets,
  findNextOpenExercise,
  isExerciseDone,
  normalizeDraft,
  sameNumber,
} from "./utils/workoutCheckin";

export default function Workout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const checkinIdParam = searchParams.get("checkin_id");
  const navigate = useNavigate();

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

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
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

  const { status: autosaveStatus, saveNow } = useCheckinAutosave({
    watch,
    enabled: !loading && !notFound && Boolean(workout),
    checkinId,
    onCheckinCreated: setCheckinId,
    buildPayload,
    draftId,
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

  const handleToggleSet = (exerciseIndex, setIndex) => {
    const path = `exercises.${exerciseIndex}.sets.${setIndex}.completed`;
    const completed = !getValues(path);

    setValue(path, completed, { shouldDirty: true });

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

      const payload = buildCheckinPayload(id, data);

      const request = checkinId
        ? workoutCheckinsService.update(checkinId, payload)
        : workoutCheckinsService.create(payload);

      const saved = await crudToast(request, {
        action: checkinId ? "update" : "create",
        entity: "Check-in",
      });

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
        <div className="flex items-start justify-between gap-3">
          <PageTitle
            eyebrow={checkinId ? "Treino · editando" : "Treino"}
            title={workout?.name || "Treino"}
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

        {loading ? (
          <Card className="border-border/80 bg-card/90">
            <CardContent className="space-y-8 px-6 py-6 sm:px-8">
              <FormSkeleton fields={1} columns={1} footer={false} />
              <ListSkeleton count={3} columns="" lines={4} />
            </CardContent>
          </Card>
        ) : notFound ? (
          <Card className="border-border/80 bg-card/80">
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

            <div className="space-y-3">
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

            <section className="relative mt-6 overflow-hidden rounded-xl border border-border bg-surface/60 p-4 pl-5 sm:p-5 sm:pl-6">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-primary/70"
              />
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-foreground">
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
            />
          </form>
        )}

        {confirmState ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-label="Fechar"
              onClick={() => setConfirmState(null)}
            />

            <Card className="relative z-50 w-full max-w-md border-border/80 bg-card">
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
