import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import FormSkeleton from "../../../components/loading/FormSkeleton";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import muscleGroupsService from "../../../services/MuscleGroupsService";
import studentsService from "../../../services/StudentsService";
import workoutsService from "../../../services/WorkoutsService";
import ExercisePicker from "./components/ExercisePicker";
import MuscleGroupSelect from "./components/MuscleGroupSelect";
import WorkoutExerciseCard from "./components/WorkoutExerciseCard";
import { getTodayISO, workoutSchema } from "./utils";

const emptyToNull = (value) =>
  value === "" || value === undefined ? null : value;

const mapSeriesFromApi = (series = []) =>
  [...series]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      repetitions: item.repetitions ?? "",
      weight: item.weight ?? "",
      rest_time: item.rest_time ?? "",
      rir: item.rir ?? "",
      tempo: item.tempo || "",
      cadence: item.cadence || "",
      duration: item.duration ?? "",
      notes: item.notes || "",
    }));

const mapSeriesToPayload = (series = []) =>
  series.map((item, index) => ({
    order: index + 1,
    repetitions: emptyToNull(item.repetitions),
    weight: emptyToNull(item.weight),
    rest_time: emptyToNull(item.rest_time),
    rir: emptyToNull(item.rir),
    tempo: emptyToNull(item.tempo),
    cadence: emptyToNull(item.cadence),
    duration: emptyToNull(item.duration),
    notes: emptyToNull(item.notes),
  }));

export default function WorkoutsNewEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [muscleGroupOptions, setMuscleGroupOptions] = useState([]);
  const [muscleGroupsLoading, setMuscleGroupsLoading] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(workoutSchema),
    defaultValues: {
      student_profile_id: "",
      name: "",
      description: "",
      start_date: getTodayISO(),
      end_date: "",
      muscle_groups: [],
      exercises: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "exercises",
  });

  const watchedMuscleGroups = watch("muscle_groups") || [];

  const pageTitle = useMemo(
    () => ({
      eyebrow: isEdit ? "Edição" : "Montagem",
      title: isEdit ? "Editar treino" : "Novo treino",
      description: isEdit
        ? "Atualize os dados do treino e os exercícios selecionados."
        : "Selecione o aluno, informe os dados do treino e adicione os exercícios.",
    }),
    [isEdit],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsData, muscleGroupsData, workout] = await Promise.all([
          studentsService.getAll(),
          muscleGroupsService.getAll(),
          isEdit ? workoutsService.getById(id) : Promise.resolve(null),
        ]);

        setStudents(studentsData || []);
        setMuscleGroupOptions(muscleGroupsData || []);

        if (isEdit && workout) {
          const sortedExercises = [...(workout.workout_exercises || [])].sort(
            (a, b) => a.order - b.order,
          );

          setExerciseDetails(
            Object.fromEntries(
              sortedExercises
                .filter((item) => item.exercise)
                .map((item) => [String(item.exercise_id), item.exercise]),
            ),
          );

          reset({
            student_profile_id: String(workout.student_profile_id || ""),
            name: workout.name || "",
            description: workout.description || "",
            start_date: workout.start_date
              ? workout.start_date.slice(0, 10)
              : getTodayISO(),
            end_date: workout.end_date ? workout.end_date.slice(0, 10) : "",
            muscle_groups: (workout.muscle_groups || []).map((item) => item.id),
            exercises: sortedExercises.map((item) => ({
              exercise_id: String(item.exercise_id),
              notes: item.notes || "",
              series: mapSeriesFromApi(item.series),
            })),
          });
        }
      } catch {
        toast.error("Não foi possível carregar os dados do treino.");
      } finally {
        setInitialLoading(false);
        setMuscleGroupsLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, reset]);

  const handleAddExercise = (exercise) => {
    setExerciseDetails((current) => ({
      ...current,
      [String(exercise.id)]: exercise,
    }));

    append({
      exercise_id: String(exercise.id),
      notes: "",
      series: [],
    });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        student_profile_id: data.student_profile_id,
        name: data.name,
        description: emptyToNull(data.description),
        start_date: data.start_date,
        end_date: emptyToNull(data.end_date),
        muscle_groups: (data.muscle_groups || []).map(Number),
        exercises: data.exercises.map((item, index) => ({
          exercise_id: Number(item.exercise_id),
          order: index + 1,
          notes: emptyToNull(item.notes),
          series: mapSeriesToPayload(item.series),
        })),
      };

      const request = isEdit
        ? workoutsService.update(id, payload)
        : workoutsService.create(payload);

      await crudToast(request, {
        action: isEdit ? "update" : "create",
        entity: "Treino",
        onError: (error) => {
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            Object.entries(validationErrors).forEach(([field, messages]) => {
              setError(field, { type: "server", message: messages[0] });
            });
          }
        },
      });

      navigate("/trainer/workouts");
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle {...pageTitle} />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/workouts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {isEdit ? "Editar treino" : "Novo treino"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Atualize as informações do treino."
              : "Preencha os campos necessários para montar um novo treino."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <FormSkeleton fields={6} columns={2} />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student_profile_id">Aluno</Label>
                  <Select
                    id="student_profile_id"
                    {...register("student_profile_id")}
                  >
                    <option value="">Selecione</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user?.name || `Aluno #${student.id}`}
                      </option>
                    ))}
                  </Select>
                  {errors.student_profile_id ? (
                    <p className="text-sm text-red-400">
                      {errors.student_profile_id.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do treino</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Treino A - Peito e tríceps"
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                  />
                  {errors.start_date ? (
                    <p className="text-sm text-red-400">
                      {errors.start_date.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de término</Label>
                  <Input id="end_date" type="date" {...register("end_date")} />
                  {errors.end_date ? (
                    <p className="text-sm text-red-400">
                      {errors.end_date.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Observações gerais sobre o treino (opcional)"
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-sm text-red-400">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 border-t border-border/80 pt-6">
                <Label htmlFor="muscle_groups">
                  Grupos musculares do treino
                </Label>
                <p className="text-sm text-muted-foreground">
                  Selecione os grupos trabalhados para filtrar a lista de
                  exercícios abaixo. Deixe em branco para ver todos.
                </p>
                <Controller
                  control={control}
                  name="muscle_groups"
                  render={({ field }) => (
                    <MuscleGroupSelect
                      options={muscleGroupOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      loading={muscleGroupsLoading}
                    />
                  )}
                />
              </div>

              <div className="space-y-4 border-t border-border/80 pt-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Exercícios do treino
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Busque e adicione os exercícios, monte as séries de cada um
                    e use as setas para reordenar.
                  </p>
                </div>

                <ExercisePicker
                  muscleGroups={watchedMuscleGroups}
                  addedIds={fields.map((field) => field.exercise_id)}
                  onAdd={handleAddExercise}
                />

                {errors.exercises?.message ? (
                  <p className="text-sm text-red-400">
                    {errors.exercises.message}
                  </p>
                ) : null}

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const exercise = exerciseDetails[String(field.exercise_id)];

                    return (
                      <WorkoutExerciseCard
                        key={field.id}
                        control={control}
                        register={register}
                        index={index}
                        exercise={exercise}
                        errors={errors.exercises?.[index]}
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                        onMoveUp={() => move(index, index - 1)}
                        onMoveDown={() => move(index, index + 1)}
                        onRemove={() => remove(index)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/trainer/workouts")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  {loading || isSubmitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading || isSubmitting
                    ? "Salvando..."
                    : isEdit
                      ? "Salvar alterações"
                      : "Criar treino"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
