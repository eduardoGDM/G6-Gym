import * as yup from "yup";

export const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyToUndefined = (value, originalValue) =>
  originalValue === "" ? undefined : value;

const optionalNumber = (min) =>
  yup
    .number()
    .transform(emptyToUndefined)
    .typeError("Informe um número válido")
    .nullable()
    .notRequired()
    .min(min, `O valor deve ser maior ou igual a ${min}`);

export const checkinSetSchema = yup.object({
  set_number: yup.number().required(),
  performed_weight: optionalNumber(0),
  performed_repetitions: optionalNumber(0),
  performed_rest_time: optionalNumber(0),
  notes: yup.string().trim().nullable().notRequired(),
});

export const checkinExerciseSchema = yup.object({
  exercise_id: yup.number().required(),
  notes: yup.string().trim().nullable().notRequired(),
  sets: yup.array().of(checkinSetSchema),
});

export const checkinSchema = yup.object({
  performed_at: yup
    .string()
    .trim()
    .required("Informe a data do treino")
    .max(10, "Data inválida")
    .test(
      "not-future",
      "A data não pode ser no futuro",
      (value) => !value || value <= getTodayISO(),
    ),
  notes: yup.string().trim().nullable().notRequired(),
  exercises: yup
    .array()
    .of(checkinExerciseSchema)
    .min(1, "Este treino não possui exercícios cadastrados"),
});
