import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionIconButton from "../../components/common/ActionIconButton";
import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import Spinner from "../../components/common/Spinner";
import FormSkeleton from "../../components/loading/FormSkeleton";
import ListSkeleton from "../../components/loading/ListSkeleton";
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
import { Textarea } from "../../components/ui/textarea";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";
import workoutsService from "../../services/WorkoutsService";
import { checkinSchema, getTodayISO } from "./utils/checkinSchema";

const emptyToNull = (value) =>
  value === "" || value === undefined ? null : value;

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

      const series = [...(item.series || [])].sort(
        (a, b) => a.order - b.order,
      );

      return {
        exercise_id: item.exercise_id,
        exercise_name: item.exercise?.name || `Exercício #${item.exercise_id}`,
        muscle_group: item.exercise?.muscle_group?.name || "",
        video_url: item.exercise?.video_url || null,
        notes: existingExercise?.notes || "",
        sets: series.map((s) => {
          const existingSet = existingSetByNumber.get(s.order);

          return {
            set_number: s.order,
            planned_repetitions: s.repetitions,
            planned_weight: s.weight,
            planned_rest_time: s.rest_time,
            performed_weight: existingSet?.performed_weight ?? s.weight ?? "",
            performed_repetitions:
              existingSet?.performed_repetitions ?? s.repetitions ?? "",
            performed_rest_time:
              existingSet?.performed_rest_time ?? s.rest_time ?? "",
            notes: existingSet?.notes || "",
          };
        }),
      };
    });
};

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

  const {
    register,
    control,
    handleSubmit,
    reset,
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
          const todaysCheckin = await workoutCheckinsService.getByDate(
            getTodayISO(),
          );

          if (
            todaysCheckin &&
            Number(todaysCheckin.workout_id) === Number(id)
          ) {
            checkin = todaysCheckin;
          }
        }

        if (!active) return;

        setCheckinId(checkin?.id || null);

        reset({
          performed_at: checkin?.performed_at
            ? checkin.performed_at.slice(0, 10)
            : getTodayISO(),
          notes: checkin?.notes || "",
          exercises: buildExerciseDefaults(
            workoutData.workout_exercises,
            checkin,
          ),
        });
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
  }, [id, checkinIdParam, reset]);

  const submitCheckin = async (data) => {
    try {
      setSubmitting(true);

      const payload = {
        workout_id: Number(id),
        performed_at: data.performed_at,
        notes: emptyToNull(data.notes),
        exercises: data.exercises.map((item) => ({
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
      };

      const request = checkinId
        ? workoutCheckinsService.update(checkinId, payload)
        : workoutCheckinsService.create(payload);

      await crudToast(request, {
        action: checkinId ? "update" : "create",
        entity: "Check-in",
      });

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
          <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
            <CardTitle className="text-2xl">
              {checkinId ? "Editar check-in" : "Registrar check-in"}
            </CardTitle>
            <CardDescription>
              {checkinId
                ? "Você já registrou este treino nesta data. Ajuste os valores se necessário."
                : "Preencha os dados de cada exercício conforme você realizou o treino."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 sm:px-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="performed_at">Data do treino</Label>
                  <Input
                    id="performed_at"
                    type="date"
                    max={getTodayISO()}
                    {...register("performed_at")}
                  />
                  {errors.performed_at ? (
                    <p className="text-sm text-red-400">
                      {errors.performed_at.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações gerais</Label>
                <Textarea
                  id="notes"
                  placeholder="Como foi o treino? (opcional)"
                  {...register("notes")}
                />
              </div>

              <div className="space-y-4 border-t border-border/80 pt-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Exercícios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Informe a carga e repetições que você realizou em cada
                    exercício.
                  </p>
                </div>

                {errors.exercises?.message ? (
                  <p className="text-sm text-red-400">
                    {errors.exercises.message}
                  </p>
                ) : null}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-border/60 bg-background/40"
                    >
                      <CardContent className="space-y-4 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">
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

                        <div className="space-y-3">
                          {(field.sets || []).map((set, setIndex) => (
                            <div
                              key={`${field.id}-set-${set.set_number}`}
                              className="space-y-3 rounded-xl border border-border/60 bg-card/60 p-4"
                            >
                              <p className="text-sm font-semibold text-foreground">
                                Série {set.set_number}
                              </p>

                              <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`exercises.${index}.sets.${setIndex}.performed_weight`}
                                  >
                                    Carga (kg)
                                    {set.planned_weight ? (
                                      <span className="ml-1 font-normal text-muted-foreground">
                                        (prescrito: {set.planned_weight})
                                      </span>
                                    ) : null}
                                  </Label>
                                  <Input
                                    id={`exercises.${index}.sets.${setIndex}.performed_weight`}
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    {...register(
                                      `exercises.${index}.sets.${setIndex}.performed_weight`,
                                    )}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`exercises.${index}.sets.${setIndex}.performed_repetitions`}
                                  >
                                    Repetições
                                    {set.planned_repetitions ? (
                                      <span className="ml-1 font-normal text-muted-foreground">
                                        (prescrito: {set.planned_repetitions})
                                      </span>
                                    ) : null}
                                  </Label>
                                  <Input
                                    id={`exercises.${index}.sets.${setIndex}.performed_repetitions`}
                                    type="number"
                                    min="0"
                                    {...register(
                                      `exercises.${index}.sets.${setIndex}.performed_repetitions`,
                                    )}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`exercises.${index}.sets.${setIndex}.performed_rest_time`}
                                  >
                                    Descanso (s)
                                    {set.planned_rest_time ? (
                                      <span className="ml-1 font-normal text-muted-foreground">
                                        (prescrito: {set.planned_rest_time})
                                      </span>
                                    ) : null}
                                  </Label>
                                  <Input
                                    id={`exercises.${index}.sets.${setIndex}.performed_rest_time`}
                                    type="number"
                                    min="0"
                                    {...register(
                                      `exercises.${index}.sets.${setIndex}.performed_rest_time`,
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`exercises.${index}.sets.${setIndex}.notes`}
                                >
                                  Observação da série
                                </Label>
                                <Textarea
                                  id={`exercises.${index}.sets.${setIndex}.notes`}
                                  placeholder="Ex: falha muscular, diminuí a carga, dor no ombro... (opcional)"
                                  {...register(
                                    `exercises.${index}.sets.${setIndex}.notes`,
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`exercises.${index}.notes`}>
                            Observação geral do exercício
                          </Label>
                          <Textarea
                            id={`exercises.${index}.notes`}
                            placeholder="Observação geral sobre o exercício (opcional)"
                            {...register(`exercises.${index}.notes`)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/student/my-workouts")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {submitting
                    ? "Salvando..."
                    : checkinId
                      ? "Salvar alterações"
                      : "Concluir treino"}
                </Button>
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
    </PageContainer>
  );
}
