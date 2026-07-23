import * as yup from "yup";

import { CPF_REGEX, PHONE_REGEX } from "./regex";
import { isNotInFuture, isValidCpf } from "./validators";

export const studentSchema = yup.object({
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
    .nullable()
    .when("$isEdit", {
      is: true,
      then: (schema) =>
        schema
          .notRequired()
          .test(
            "min-if-present",
            "A senha deve ter no mínimo 6 caracteres",
            (value) => !value || value.length >= 6,
          ),
      otherwise: (schema) =>
        schema
          .required("A senha é obrigatória")
          .min(6, "A senha deve ter no mínimo 6 caracteres"),
    }),
  cpf: yup
    .string()
    .trim()
    .required("O CPF é obrigatório")
    .matches(CPF_REGEX, "O CPF deve estar no formato 000.000.000-00")
    .test("cpf-check-digits", "O CPF informado é inválido", isValidCpf),
  phone: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "phone-format",
      "Telefone inválido. Use o formato (00) 00000-0000",
      (value) => !value || PHONE_REGEX.test(value),
    ),
  birth_date: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "not-in-future",
      "A data de nascimento não pode ser posterior a hoje",
      isNotInFuture,
    ),
  gender: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .oneOf(["", "Masculino", "Feminino", "Outro"], "Selecione um sexo válido"),
  height: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .notRequired()
    .min(0, "A altura deve ser maior ou igual a 0")
    .max(3, "A altura deve ser menor ou igual a 3"),
  // O peso saiu do cadastro do aluno: ele é registrado na avaliação física
  // (physicalAssessmentSchema), que mantém o histórico.
  observations: yup.string().trim().nullable().notRequired(),
});
