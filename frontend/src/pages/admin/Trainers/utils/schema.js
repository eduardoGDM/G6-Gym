import * as yup from "yup";

export const trainerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("O nome é obrigatório")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  email: yup
    .string()
    .trim()
    .required("O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: yup
    .string()
    .trim()
    .required("A senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});
