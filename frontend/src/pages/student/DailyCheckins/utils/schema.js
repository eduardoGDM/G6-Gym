import * as yup from "yup";

export const getYesterdayISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const rating = yup
  .number()
  .transform((value, originalValue) => (originalValue === "" ? undefined : value))
  .typeError("Informe uma nota válida")
  .required("A nota é obrigatória")
  .min(0, "A nota deve ser entre 0 e 10")
  .max(10, "A nota deve ser entre 0 e 10");

export const dailyCheckinSchema = yup.object({
  date: yup
    .string()
    .trim()
    .required("Informe a data")
    .test(
      "not-future",
      "A data não pode ser no futuro",
      (value) => !value || value <= getTodayISO(),
    ),
  sleep_rating: rating,
  sleep_notes: yup.string().trim().nullable().notRequired(),
  diet_rating: rating,
  diet_notes: yup.string().trim().nullable().notRequired(),
});
