import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import { crudToast } from "../../../components/common/crudToast";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
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
import exercisesService from "../../../services/ExercisesService";
import studentsService from "../../../services/StudentsService";
import workoutsService from "../../../services/WorkoutsService";
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
  const [exercisesList, setExercisesList] = useState([]);
  const [exerciseToAdd, setExerciseToAdd] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(workoutSchema),
    defaultValues: {
      student_profile_id: "",
      name: "",
      description: "",
      start_date: getTodayISO(),
      end_date: "",
      exercises: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "exercises",
  });

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
        const [studentsData, exercisesData, workout] = await Promise.all([
          studentsService.getAll(),
          exercisesService.getAll(),
          isEdit ? workoutsService.getById(id) : Promise.resolve(null),
        ]);

        setStudents(studentsData || []);
        setExercisesList(exercisesData || []);

        if (isEdit && workout) {
          const sortedExercises = [...(workout.workout_exercises || [])].sort(
            (a, b) => a.order - b.order,
          );

          reset({
            student_profile_id: String(workout.student_profile_id || ""),
            name: workout.name || "",
            description: workout.description || "",
            start_date: workout.start_date
              ? workout.start_date.slice(0, 10)
              : getTodayISO(),
            end_date: workout.end_date ? workout.end_date.slice(0, 10) : "",
            exercises: sortedExercises.map((item) => ({
              exercise_id: String(item.exercise_id),
              notes: item.notes || "",
              series: mapSeriesFromApi(item.series),
            })),
          });
        }
      } catch (error) {
        toast.error("Não foi possível carregar os dados do treino.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, reset]);

  const handleAddExercise = () => {
    if (!exerciseToAdd) return;

    append({
      exercise_id: exerciseToAdd,
      notes: "",
      series: [],
    });
    setExerciseToAdd("");
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
              ? "Atualize as informações do treino conforme as regras do controller."
              : "Preencha os campos necessários para montar um novo treino."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <PageLoader label="Carregando formulário..." />
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

              <div className="space-y-4 border-t border-border/80 pt-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Exercícios do treino
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione os exercícios, monte as séries de cada um e use
                    as setas para reordenar.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="exercise_to_add">
                      Adicionar exercício
                    </Label>
                    <Select
                      id="exercise_to_add"
                      value={exerciseToAdd}
                      onChange={(event) => setExerciseToAdd(event.target.value)}
                    >
                      <option value="">Selecione um exercício</option>
                      {exercisesList.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                          {exercise.muscle_group?.name
                            ? ` — ${exercise.muscle_group.name}`
                            : ""}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddExercise}
                    disabled={!exerciseToAdd}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {errors.exercises?.message ? (
                  <p className="text-sm text-red-400">
                    {errors.exercises.message}
                  </p>
                ) : null}

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const exercise = exercisesList.find(
                      (item) => String(item.id) === String(field.exercise_id),
                    );

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
