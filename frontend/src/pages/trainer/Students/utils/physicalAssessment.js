import * as yup from "yup";

import {
  MEASURE_FIELDS,
  MEASURE_GROUPS,
} from "../../../../components/physicalAssessment/fields";
import { getTodayISO } from "./formatters";
import { isNotInFuture } from "./validators";

const measureShape = Object.fromEntries(
  MEASURE_GROUPS.flatMap((group) =>
    group.fields.map((field) => [
      field.name,
      yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .notRequired()
        .typeError(`${field.label} deve ser um número`)
        .min(0, `${field.label} deve ser maior ou igual a 0`)
        .max(field.max, `${field.label} deve ser menor ou igual a ${field.max}`),
    ]),
  ),
);

export const physicalAssessmentSchema = yup.object({
  assessment_date: yup
    .string()
    .trim()
    .required("A data da avaliação é obrigatória")
    .test(
      "not-in-future",
      "A data da avaliação não pode ser posterior a hoje",
      isNotInFuture,
    ),
  notes: yup.string().trim().nullable().notRequired(),
  ...measureShape,
});

const emptyMeasures = () =>
  Object.fromEntries(MEASURE_FIELDS.map((field) => [field, ""]));

/**
 * Valores do formulário a partir de uma avaliação existente.
 *
 * Sem `assessment` (nova avaliação a partir do zero) devolve o formulário
 * vazio com a data de hoje.
 */
export const assessmentToFormValues = (assessment) => ({
  assessment_date: assessment?.assessment_date || getTodayISO(),
  notes: assessment?.notes || "",
  ...emptyMeasures(),
  ...Object.fromEntries(
    MEASURE_FIELDS.map((field) => [
      field,
      assessment?.measures?.[field]?.value ?? "",
    ]),
  ),
});

/**
 * Prefill de reavaliação: repete as medidas da última avaliação, mas com a data
 * de hoje e sem as observações antigas. O personal só altera o que mudou.
 */
export const reassessmentFormValues = (latestAssessment) => ({
  ...assessmentToFormValues(latestAssessment),
  assessment_date: getTodayISO(),
  notes: "",
});

/** Converte os campos vazios do formulário em null para o payload da API. */
export const toAssessmentPayload = (values) => ({
  assessment_date: values.assessment_date,
  notes: values.notes?.trim() ? values.notes.trim() : null,
  ...Object.fromEntries(
    MEASURE_FIELDS.map((field) => [
      field,
      values[field] === "" || values[field] === undefined
        ? null
        : values[field],
    ]),
  ),
});

export const hasAnyMeasure = (payload) =>
  MEASURE_FIELDS.some(
    (field) => payload[field] !== null && payload[field] !== undefined,
  );
