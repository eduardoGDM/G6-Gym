// Helpers de leitura para a visualização da ficha (WorkoutsShow).
// Transformam a lista de séries de um exercício em um resumo técnico
// escaneável, sem alterar dados nem regras de negócio.

const nonEmpty = (value) =>
  value !== null && value !== undefined && value !== "";

// Valores distintos preservando a ordem de aparição (ex.: repetições, RIR).
export const uniqueValues = (series, key) => {
  const seen = new Set();
  const result = [];

  for (const item of series) {
    const value = item?.[key];
    if (nonEmpty(value) && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};

// Tipo predominante (mais frequente) entre as séries do exercício.
export const predominantType = (series) => {
  const counts = new Map();

  for (const item of series) {
    if (nonEmpty(item?.type)) {
      counts.set(item.type, (counts.get(item.type) || 0) + 1);
    }
  }

  let best = null;
  let bestCount = 0;
  for (const [type, count] of counts) {
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }

  return best;
};

// Carga: remove casas decimais desnecessárias e adiciona a unidade.
export const formatWeight = (value) => {
  if (!nonEmpty(value)) return null;

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const normalized = Number.isInteger(num) ? num : Number(num.toFixed(2));
  return `${String(normalized).replace(".", ",")} kg`;
};

export const formatSeconds = (value) => (nonEmpty(value) ? `${value}s` : null);

// RIR exibido de forma amigável ("FALHA" -> "Falha").
export const formatRirValue = (value) => {
  if (!nonEmpty(value)) return null;
  return value === "FALHA" ? "Falha" : value;
};

// Sufixo do detalhamento da série ("RIR 2" ou "Falha").
export const formatRirTag = (value) => {
  if (!nonEmpty(value)) return null;
  return value === "FALHA" ? "Falha" : `RIR ${value}`;
};

// Monta o resumo técnico usado na coluna "Configuração".
export const buildConfigSummary = (series) => ({
  count: series.length,
  predominant: predominantType(series),
  repetitions: uniqueValues(series, "repetitions"),
  rir: uniqueValues(series, "rir").map(formatRirValue),
  techniques: uniqueValues(series, "advanced_technique"),
  cadence: uniqueValues(series, "cadence"),
  rest: uniqueValues(series, "rest_time").map((value) => `${value}s`),
});
