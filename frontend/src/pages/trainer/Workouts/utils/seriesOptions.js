// Constantes compartilhadas das séries de treino (prescrição).
// Centralizadas para manter validação (schema), formulário e visualização
// sempre alinhados com o backend.

// Repetições: aceita três formatos ->
//  - valor único (ex.: 8)
//  - intervalo (ex.: 7-12)
//  - valor por série, separado por "x" (ex.: 6x6x6x6)
export const REPETITIONS_REGEX = /^(\d+(-\d+)?|\d+(x\d+)+)$/;

export const REPETITIONS_HINT =
  "Aceita valor único (8), intervalo (7-12) ou valor por série (6x6x6x6).";
export const REPETITIONS_PLACEHOLDER = "8, 7-12 ou 6x6x6x6";

export const SERIES_TYPES = ["Aquecimento", "Reconhecimento", "Válida"];

export const RIR_OPTIONS = ["0", "1", "2", "3", "4", "FALHA"];

export const ADVANCED_TECHNIQUES = [
  "Drop Set",
  "Muscle Round",
  "Parciais",
  "Backoff Set",
  "Cluster Set",
];

// Descrições fixas das técnicas avançadas (definidas pela aplicação, não
// editáveis pelo personal). Usadas na ficha (visualização e PDF).
export const ADVANCED_TECHNIQUE_DESCRIPTIONS = {
  "Drop Set": "Reduza a carga (~30%) após a falha e continue sem descanso.",
  "Muscle Round":
    "6 mini-séries de 6 repetições com pausas de 10–15 segundos.",
  "Cluster Set": "Divida a série em pequenos blocos com pausas curtas entre eles.",
  "Backoff Set":
    "Após as séries principais, reduza a carga (30–40%) e realize uma série adicional.",
  Parciais: "Após a falha, continue com repetições parciais na faixa de maior tensão.",
};

export const DEFAULT_SERIES_TYPE = "Válida";

export const CADENCE_MAX_LENGTH = 50;
