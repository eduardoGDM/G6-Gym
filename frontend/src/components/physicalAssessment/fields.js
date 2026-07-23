/**
 * Metadados das medidas da avaliação física, compartilhados entre a tela do
 * personal (que edita) e a do aluno (que só consulta).
 *
 * `max` espelha a validação do backend. Nenhuma medida é obrigatória.
 */
export const MEASURE_GROUPS = [
  {
    key: "composition",
    title: "Composição corporal",
    description:
      "Peso e dados da balança de bioimpedância. O percentual de gordura é digitado, não calculado.",
    fields: [
      { name: "weight", label: "Peso (kg)", max: 500, placeholder: "72.50" },
      {
        name: "height",
        label: "Altura (m)",
        max: 3,
        step: "0.01",
        placeholder: "1.75",
      },
      {
        name: "fat_percentage",
        label: "% de gordura",
        max: 100,
        placeholder: "18.40",
      },
      {
        name: "muscle_mass",
        label: "Massa muscular (kg)",
        max: 500,
        placeholder: "35.00",
      },
    ],
  },
  {
    key: "circumferences",
    title: "Circunferências",
    description: "Todas as medidas em centímetros.",
    fields: [
      { name: "neck", label: "Pescoço", max: 300 },
      { name: "shoulder", label: "Ombro", max: 300 },
      { name: "chest", label: "Tórax", max: 300 },
      { name: "waist", label: "Cintura", max: 300 },
      { name: "abdomen", label: "Abdômen", max: 300 },
      { name: "hip", label: "Quadril", max: 300 },
      { name: "left_arm", label: "Braço relaxado (E)", max: 300 },
      { name: "right_arm", label: "Braço relaxado (D)", max: 300 },
      { name: "left_arm_contracted", label: "Braço contraído (E)", max: 300 },
      { name: "right_arm_contracted", label: "Braço contraído (D)", max: 300 },
      { name: "left_forearm", label: "Antebraço (E)", max: 300 },
      { name: "right_forearm", label: "Antebraço (D)", max: 300 },
      { name: "left_thigh", label: "Coxa (E)", max: 300 },
      { name: "right_thigh", label: "Coxa (D)", max: 300 },
      { name: "left_calf", label: "Panturrilha (E)", max: 300 },
      { name: "right_calf", label: "Panturrilha (D)", max: 300 },
    ],
  },
];

export const MEASURE_FIELDS = MEASURE_GROUPS.flatMap((group) =>
  group.fields.map((field) => field.name),
);

const MEASURE_LABELS = Object.fromEntries(
  MEASURE_GROUPS.flatMap((group) =>
    group.fields.map((field) => [field.name, field.label]),
  ),
);

export const getMeasureLabel = (name) => MEASURE_LABELS[name] || name;

/**
 * Valores calculados na leitura pelo backend (nunca gravados). `lean_mass` é a
 * massa magra derivada (peso - massa gorda) e não se confunde com a
 * `muscle_mass` digitada da balança.
 */
export const DERIVED_FIELDS = [
  { name: "imc", label: "IMC" },
  { name: "waist_hip_ratio", label: "Cintura/Quadril" },
  { name: "fat_mass", label: "Massa gorda (kg)" },
  { name: "lean_mass", label: "Massa magra (kg)" },
];

export const formatMeasureValue = (value) =>
  value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export const formatAssessmentDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};
