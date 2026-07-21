import * as yup from "yup";

export const exerciseSchema = yup.object({
  muscle_group_id: yup.string().required("Selecione um grupo muscular"),
  name: yup
    .string()
    .trim()
    .required("O nome é obrigatório")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  description: yup.string().trim().nullable().notRequired(),
  equipment: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .max(255, "O equipamento deve ter no máximo 255 caracteres"),
  video_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .url("Digite uma URL válida"),
});
