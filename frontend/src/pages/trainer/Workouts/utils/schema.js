import * as yup from "yup";

const emptyToUndefined = (value, originalValue) =>
  originalValue === "" ? undefined : value;

const optionalNumber = (min, max) => {
  let schema = yup
    .number()
    .transform(emptyToUndefined)
    .typeError("Informe um número válido")
    .nullable()
    .notRequired()
    .min(min, `O valor deve ser maior ou igual a ${min}`);

  if (max !== undefined) {
    schema = schema.max(max, `O valor deve ser menor ou igual a ${max}`);
  }

  return schema;
};

export const workoutExerciseSeriesSchema = yup.object({
  repetitions: optionalNumber(0),
  weight: optionalNumber(0),
  rest_time: optionalNumber(0),
  rir: optionalNumber(0, 10),
  tempo: yup.string().trim().nullable().notRequired(),
  cadence: yup.string().trim().nullable().notRequired(),
  duration: optionalNumber(0),
  notes: yup.string().trim().nullable().notRequired(),
});

export const workoutExerciseItemSchema = yup.object({
  exercise_id: yup.string().required("Selecione um exercício"),
  notes: yup.string().trim().nullable().notRequired(),
  series: yup.array().of(workoutExerciseSeriesSchema).notRequired(),
});

export const workoutSchema = yup.object({
  student_profile_id: yup.string().required("Selecione um aluno"),
  name: yup
    .string()
    .trim()
    .required("O nome do treino é obrigatório")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  description: yup.string().trim().nullable().notRequired(),
  start_date: yup.string().trim().required("Informe a data de início"),
  end_date: yup.string().trim().nullable().notRequired(),
  muscle_groups: yup.array().of(yup.number()).notRequired(),
  exercises: yup
    .array()
    .of(workoutExerciseItemSchema)
    .min(1, "Adicione pelo menos um exercício ao treino"),
});
