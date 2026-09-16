export const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const emptyToNull = (value) => (hasValue(value) ? value : null);

// Carga vem como decimal em string ("30.00"); exibimos sem casas supérfluas e
// no padrão pt-BR ("82,5").
export const formatWeight = (value) => {
  if (!hasValue(value)) return null;
  const number = Number(value);
  return Number.isNaN(number)
    ? String(value)
    : number.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};

/**
 * Resumo "40 kg × 12" de uma série. Retorna null quando nada foi informado.
 */
export const formatSetSummary = (weight, repetitions) => {
  const formattedWeight = formatWeight(weight);
  const parts = [
    formattedWeight ? `${formattedWeight} kg` : null,
    hasValue(repetitions) ? String(repetitions) : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" × ") : null;
};

/**
 * Compara dois valores numéricos vindos de input/API ("40" e "40.00" são iguais).
 */
export const sameNumber = (a, b) => {
  if (!hasValue(a) && !hasValue(b)) return true;
  if (!hasValue(a) || !hasValue(b)) return false;
  return Number(a) === Number(b);
};

const isSetDone = (set) => Boolean(set?.completed);

export const isExerciseDone = (exercise) =>
  (exercise?.sets || []).every(isSetDone);

export const countSets = (exercises = []) =>
  exercises.reduce(
    (acc, exercise) => {
      const sets = exercise?.sets || [];
      acc.total += sets.length;
      acc.done += sets.filter(isSetDone).length;
      return acc;
    },
    { done: 0, total: 0 },
  );

/**
 * Índice do primeiro exercício com série pendente, procurando a partir de
 * `from` (exclusivo) e dando a volta na lista. null quando tudo foi feito.
 */
export const findNextOpenExercise = (exercises = [], from = -1) => {
  const total = exercises.length;

  for (let step = 1; step <= total; step += 1) {
    const index = (from + step + total) % total;
    if (!isExerciseDone(exercises[index])) return index;
  }

  return null;
};

export const buildCheckinPayload = (workoutId, data) => ({
  workout_id: Number(workoutId),
  performed_at: data.performed_at,
  notes: emptyToNull(data.notes),
  exercises: (data.exercises || []).map((item) => ({
    exercise_id: item.exercise_id,
    notes: emptyToNull(item.notes),
    sets: (item.sets || []).map((set) => {
      // Série não marcada como feita: os valores na tela são só a sugestão da
      // prescrição e não podem ser registrados como executados.
      const done = isSetDone(set);

      return {
        set_number: set.set_number,
        performed_weight: done ? emptyToNull(set.performed_weight) : null,
        performed_repetitions: done
          ? emptyToNull(set.performed_repetitions)
          : null,
        performed_rest_time: done ? emptyToNull(set.performed_rest_time) : null,
        notes: emptyToNull(set.notes),
      };
    }),
  })),
});

export const buildExerciseDefaults = (workoutExercises = [], checkin = null) => {
  const checkinByExerciseId = new Map(
    (checkin?.exercises || []).map((item) => [item.exercise_id, item]),
  );

  return [...workoutExercises]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const existingExercise = checkinByExerciseId.get(item.exercise_id);
      const existingSetByNumber = new Map(
        (existingExercise?.sets || []).map((set) => [set.set_number, set]),
      );

      const series = [...(item.series || [])].sort((a, b) => a.order - b.order);

      return {
        exercise_id: item.exercise_id,
        exercise_name: item.exercise?.name || `Exercício #${item.exercise_id}`,
        muscle_group: item.exercise?.muscle_group?.name || "",
        video_url: item.exercise?.video_url || null,
        notes: existingExercise?.notes || "",
        sets: series.map((s) => {
          const existingSet = existingSetByNumber.get(s.order);

          // Repetições prescritas podem ser uma faixa (ex.: "7-12"), que não é
          // um valor válido para o input numérico de repetições realizadas.
          // Só pré-preenchemos quando a prescrição é um número único.
          const isSingleNumberReps = /^\d+$/.test(String(s.repetitions ?? ""));

          return {
            set_number: s.order,
            // Só séries marcadas como feitas são gravadas com valores (ver
            // buildCheckinPayload), então valor salvo = série concluída.
            completed:
              hasValue(existingSet?.performed_weight) ||
              hasValue(existingSet?.performed_repetitions),
            planned_type: s.type || "",
            planned_repetitions: s.repetitions ?? "",
            planned_rir: s.rir ?? "",
            planned_cadence: s.cadence || "",
            planned_advanced_technique: s.advanced_technique || "",
            planned_weight: s.weight,
            planned_rest_time: s.rest_time,
            performed_weight: existingSet?.performed_weight ?? s.weight ?? "",
            performed_repetitions:
              existingSet?.performed_repetitions ??
              (isSingleNumberReps ? s.repetitions : ""),
            performed_rest_time:
              existingSet?.performed_rest_time ?? s.rest_time ?? "",
            notes: existingSet?.notes || "",
          };
        }),
      };
    });
};

/**
 * Rascunhos locais gravados antes da marcação de série feita não têm
 * `completed`. Naquela versão tudo o que estava na tela era enviado como
 * executado, então tratamos essas séries como concluídas para não apagar dados
 * ao sincronizar o rascunho.
 */
export const normalizeDraft = (draft) =>
  draft
    ? {
        ...draft,
        exercises: (draft.exercises || []).map((exercise) => ({
          ...exercise,
          sets: (exercise.sets || []).map((set) => ({
            ...set,
            completed: set.completed ?? true,
          })),
        })),
      }
    : null;

const PRESCRIPTION_KEYS = [
  "planned_type",
  "planned_repetitions",
  "planned_weight",
  "planned_rir",
  "planned_cadence",
  "planned_advanced_technique",
];

/**
 * Separa a prescrição das séries em `common` (igual em todas — exibida uma vez
 * no exercício) e `perSet` (o que muda de série para série).
 */
export const splitPrescription = (sets = []) => {
  if (sets.length === 0) return { common: [], perSet: [] };

  const [first] = sets;
  const common = PRESCRIPTION_KEYS.filter((key) =>
    sets.every((set) =>
      key === "planned_weight"
        ? sameNumber(set[key], first[key])
        : String(set[key] ?? "") === String(first[key] ?? ""),
    ),
  );

  return {
    common,
    perSet: PRESCRIPTION_KEYS.filter((key) => !common.includes(key)),
  };
};
