import { yupResolver } from "@hookform/resolvers/yup";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CloudOff,
  History,
  Loader2,
  Save,
  TriangleAlert,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionIconButton from "../../components/common/ActionIconButton";
import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import Spinner from "../../components/common/Spinner";
import { Field } from "../../components/forms/Field";
import { FormSection } from "../../components/forms/FormSection";
import FormSkeleton from "../../components/loading/FormSkeleton";
import ListSkeleton from "../../components/loading/ListSkeleton";
import ExerciseHistoryModal from "../../components/student/ExerciseHistoryModal";
import { showWorkoutFeedbackToast } from "../../components/student/workoutFeedbackToast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { NumberStepper } from "../../components/ui/number-stepper";
import { Textarea } from "../../components/ui/textarea";
import {
  AUTOSAVE_STATUS,
  readCheckinDraft,
  useCheckinAutosave,
} from "../../hooks/useCheckinAutosave";
import { cn } from "../../lib/utils";
import gamificationService from "../../services/GamificationService";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";
import workoutsService from "../../services/WorkoutsService";
import { checkinSchema, getTodayISO } from "./utils/checkinSchema";

const emptyToNull = (value) =>
  value === "" || value === undefined ? null : value;

const buildCheckinPayload = (workoutId, data) => ({
  workout_id: Number(workoutId),
  performed_at: data.performed_at,
  notes: emptyToNull(data.notes),
  exercises: (data.exercises || []).map((item) => ({
    exercise_id: item.exercise_id,
    notes: emptyToNull(item.notes),
    sets: (item.sets || []).map((set) => ({
      set_number: set.set_number,
      performed_weight: emptyToNull(set.performed_weight),
      performed_repetitions: emptyToNull(set.performed_repetitions),
      performed_rest_time: emptyToNull(set.performed_rest_time),
      notes: emptyToNull(set.notes),
    })),
  })),
});

const buildExerciseDefaults = (workoutExercises = [], checkin = null) => {
  const checkinByExerciseId = new Map(
    (checkin?.exercises || []).map((item) => [item.exercise_id, item]),
  );

  return [...workoutExercises]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const existingExercise = checkinByExerciseId.get(item.exercise_id);
      const existingSetByNumber = new Map(
        (existingExercise?.sets || []).map((set) => [set.set_number, set]),
      );

      const series = [...(item.series || [])].sort((a, b) => a.order - b.order);

      return {
        exercise_id: item.exercise_id,
        exercise_name: item.exercise?.name || `Exercício #${item.exercise_id}`,
        muscle_group: item.exercise?.muscle_group?.name || "",
        video_url: item.exercise?.video_url || null,
        notes: existingExercise?.notes || "",
        sets: series.map((s) => {
          const existingSet = existingSetByNumber.get(s.order);

          // Repetições prescritas agora podem ser uma faixa (ex.: "7-12"), que não
          // é um valor válido para o input numérico de repetições realizadas.
          // Só pré-preenchemos quando a prescrição é um número único.
          const isSingleNumberReps = /^\d+$/.test(String(s.repetitions ?? ""));

          return {
            set_number: s.order,
            planned_type: s.type || "",
            planned_repetitions: s.repetitions ?? "",
            planned_rir: s.rir ?? "",
            planned_cadence: s.cadence || "",
            planned_advanced_technique: s.advanced_technique || "",
            planned_weight: s.weight,
            planned_rest_time: s.rest_time,
            performed_weight: existingSet?.performed_weight ?? s.weight ?? "",
            performed_repetitions:
              existingSet?.performed_repetitions ??
              (isSingleNumberReps ? s.repetitions : ""),
            performed_rest_time:
              existingSet?.performed_rest_time ?? s.rest_time ?? "",
            notes: existingSet?.notes || "",
          };
        }),
      };
    });
};

const AUTOSAVE_INDICATOR = {
  [AUTOSAVE_STATUS.PENDING]: {
    icon: Loader2,
    label: "Alterações não salvas…",
    className: "text-muted-foreground",
    spin: false,
  },
  [AUTOSAVE_STATUS.SAVING]: {
    icon: Loader2,
    label: "Salvando…",
    className: "text-muted-foreground",
    spin: true,
  },
  [AUTOSAVE_STATUS.SAVED]: {
    icon: Check,
    label: "Salvo automaticamente",
    className: "text-emerald-500",
    spin: false,
  },
  [AUTOSAVE_STATUS.OFFLINE]: {
    icon: CloudOff,
    label: "Sem conexão. Tentaremos salvar novamente.",
    className: "text-amber-500",
    spin: false,
  },
  [AUTOSAVE_STATUS.ERROR]: {
    icon: TriangleAlert,
    label: "Erro ao salvar",
    className: "text-red-400",
    spin: false,
  },
};

// Descrições das técnicas avançadas, exibidas como legenda ao tocar no chip da
// técnica na série. Mantidas em sincronia com a ficha de orientação do treino.
const TECHNIQUE_DESCRIPTIONS = {
  "Drop Set": "Reduza a carga (~30%) após a falha e continue sem descanso.",
  "Muscle Round": "6 mini-séries de 6 repetições com pausas de 10–15 segundos.",
  "Cluster Set":
    "Divida a série em pequenos blocos com pausas curtas entre eles.",
  "Backoff Set":
    "Após as séries principais, reduza a carga (30–40%) e realize uma série adicional.",
  Parciais:
    "Após a falha, continue com repetições parciais na faixa de maior tensão.",
};

/**
 * Chips compactos com a prescrição não-numérica da série (RIR, Cadência,
 * Técnica avançada). Carga, repetições e descanso prescritos não entram aqui —
 * viram a "meta" exibida junto de cada campo, evitando informação duplicada.
 *
 * Quando a técnica avançada possui descrição, seu chip vira um botão que
 * mostra/oculta a legenda explicativa logo abaixo.
 */
function PrescriptionInfo({ set }) {
  const [showTechnique, setShowTechnique] = useState(false);

  const technique = set.planned_advanced_technique;
  const techniqueDescription = technique
    ? TECHNIQUE_DESCRIPTIONS[technique]
    : null;

  const items = [
    { label: "RIR", value: set.planned_rir },
    { label: "Cadência", value: set.planned_cadence },
  ].filter(
    (item) =>
      item.value !== null && item.value !== undefined && item.value !== "",
  );

  if (items.length === 0 && !technique) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            <span className="font-medium text-muted-foreground">
              {item.label}
            </span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </span>
        ))}

        {technique ? (
          techniqueDescription ? (
            <button
              type="button"
              onClick={() => setShowTechnique((open) => !open)}
              aria-expanded={showTechnique}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs transition-colors hover:bg-accent hover:text-foreground"
            >
              <span className="font-medium text-muted-foreground">Técnica</span>
              <span className="font-semibold text-foreground">{technique}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform",
                  showTechnique && "rotate-180",
                )}
              />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Técnica</span>
              <span className="font-semibold text-foreground">{technique}</span>
            </span>
          )
        ) : null}
      </div>

      {showTechnique && techniqueDescription ? (
        <p className="rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {techniqueDescription}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Uma série do check-in, otimizada para mobile: carga e repetições em destaque
 * (steppers −/+ de toque fácil) e os campos secundários — descanso e observação
 * — recolhidos atrás de um botão no mobile, sempre visíveis no desktop.
 */
function CheckinSet({ index, setIndex, set, control, register }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const base = `exercises.${index}.sets.${setIndex}`;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground sm:text-base">
          Série {set.set_number}
        </p>
        {set.planned_type ? (
          <Badge variant="secondary" className="uppercase tracking-wide">
            {set.planned_type}
          </Badge>
        ) : null}
      </div>

      <PrescriptionInfo set={set} />

      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${base}.performed_weight`}>Carga (kg)</Label>
          <Controller
            control={control}
            name={`${base}.performed_weight`}
            render={({ field, fieldState }) => (
              <NumberStepper
                id={`${base}.performed_weight`}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                step={2.5}
                min={0}
                precision={2}
                inputMode="decimal"
                aria-invalid={fieldState.invalid || undefined}
              />
            )}
          />
          {set.planned_weight ? (
            <p className="text-xs text-muted-foreground mt-4">
              Meta: {set.planned_weight} kg
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${base}.performed_repetitions`}>Repetições</Label>
          <Controller
            control={control}
            name={`${base}.performed_repetitions`}
            render={({ field, fieldState }) => (
              <NumberStepper
                id={`${base}.performed_repetitions`}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                step={1}
                min={0}
                precision={0}
                inputMode="numeric"
                aria-invalid={fieldState.invalid || undefined}
              />
            )}
          />
          {set.planned_repetitions ? (
            <p className="text-xs text-muted-foreground mt-4">
              Reps: {set.planned_repetitions}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((open) => !open)}
        aria-expanded={detailsOpen}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            detailsOpen && "rotate-180",
          )}
        />
        {detailsOpen ? "Ocultar detalhes" : "Descanso e observação"}
      </button>

      <div className={cn("space-y-8", !detailsOpen && "hidden", "md:block")}>
        <div className="space-y-1.5">
          <Label htmlFor={`${base}.performed_rest_time`}>Descanso (s)</Label>
          <Input
            id={`${base}.performed_rest_time`}
            type="number"
            min="0"
            inputMode="numeric"
            {...register(`${base}.performed_rest_time`)}
          />
          {set.planned_rest_time ? (
            <p className="text-xs text-muted-foreground">
              Meta: {set.planned_rest_time} s
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${base}.notes`}>Observação da série</Label>
          <Textarea
            id={`${base}.notes`}
            autoResize
            className="min-h-24"
            placeholder="Ex: falha muscular, diminuí a carga, dor no ombro... (opcional)"
            {...register(`${base}.notes`)}
          />
        </div>
      </div>
    </div>
  );
}

function AutosaveIndicator({ status }) {
  const config = AUTOSAVE_INDICATOR[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`h-4 w-4 ${config.spin ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </div>
  );
}

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

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
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
        const draft = readCheckinDraft(draftId);
        reset(draft ?? serverValues);
        if (draft) draftToSyncRef.current = draft;
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

  const submitCheckin = async (data) => {
    try {
      setSubmitting(true);

      const payload = buildCheckinPayload(id, data);

      const request = checkinId
        ? workoutCheckinsService.update(checkinId, payload)
        : workoutCheckinsService.create(payload);

      await crudToast(request, {
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

      navigate("/student/my-workouts");
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
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
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <PageTitle
            eyebrow="Check-in"
            title={workout?.name || "Treino"}
            description="Registre as cargas, repetições e observações do treino que você realizou."
          />

          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate("/student/my-workouts")}
          >
            <ArrowLeft className="h-4 w-4" />
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
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="border-b border-border/80 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl">
                    {checkinId ? "Editar check-in" : "Registrar check-in"}
                  </CardTitle>
                  <CardDescription>
                    Seus dados são salvos automaticamente enquanto você preenche
                    — não é necessário clicar em salvar.
                  </CardDescription>
                </div>
                <AutosaveIndicator status={autosaveStatus} />
              </div>
            </CardHeader>

            <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
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

                <FormSection
                  title="Exercícios"
                  description="Informe a carga e repetições que você realizou em cada exercício."
                >
                  {errors.exercises?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.exercises.message}
                    </p>
                  ) : null}

                  <div className="space-y-5">
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        className="border-border/60 bg-background/40"
                      >
                        <CardContent className="space-y-5 p-4 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-bold text-foreground">
                              {field.exercise_name}
                            </p>
                            {field.muscle_group ? (
                              <Badge variant="outline">
                                {field.muscle_group}
                              </Badge>
                            ) : null}
                            {field.video_url ? (
                              <ActionIconButton
                                icon={Video}
                                tooltip="Assistir demonstração do exercício"
                                onClick={() =>
                                  window.open(
                                    field.video_url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                                className="h-8 w-8"
                              />
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setHistoryExercise({
                                id: field.exercise_id,
                                name: field.exercise_name,
                                muscleGroup: field.muscle_group,
                              })
                            }
                            className="flex w-full items-center justify-center gap-1 rounded-lg border border-border/60 bg-muted/40 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <History className="h-4 w-4" />
                            Histórico de exercício
                          </button>

                          <div className="space-y-4 border-t border-border/50 pt-5">
                            {(field.sets || []).map((set, setIndex) => (
                              <CheckinSet
                                key={`${field.id}-set-${set.set_number}`}
                                index={index}
                                setIndex={setIndex}
                                set={set}
                                control={control}
                                register={register}
                              />
                            ))}
                          </div>

                          <Field
                            label="Observação geral do exercício"
                            htmlFor={`exercises.${index}.notes`}
                          >
                            <Textarea
                              id={`exercises.${index}.notes`}
                              autoResize
                              placeholder="Observação geral sobre o exercício (opcional)"
                              {...register(`exercises.${index}.notes`)}
                            />
                          </Field>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </FormSection>

                <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Suas informações já são salvas automaticamente. Use o botão
                    apenas para concluir e voltar.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/student/my-workouts")}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        submitting || autosaveStatus === AUTOSAVE_STATUS.SAVING
                      }
                    >
                      {submitting ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {submitting ? "Salvando..." : "Concluir treino"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
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
        />
      </div>
    </PageContainer>
  );
}
