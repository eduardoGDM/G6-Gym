import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "../../../../lib/utils";
import { formatWeight, hasValue } from "../../utils/workoutCheckin";

// Descrições das técnicas avançadas, exibidas como legenda ao tocar no chip da
// técnica. Mantidas em sincronia com a ficha de orientação do treino.
const TECHNIQUE_DESCRIPTIONS = {
  "Drop Set": "Reduza a carga (~30%) após a falha e continue sem descanso.",
  "Muscle Round": "6 mini-séries de 6 repetições com pausas de 10–15 segundos.",
  "Cluster Set":
    "Divida a série em pequenos blocos com pausas curtas entre eles.",
  "Backoff Set":
    "Após as séries principais, reduza a carga (30–40%) e realize uma série adicional.",
  Parciais:
    "Após a falha, continue com repetições parciais na faixa de maior tensão.",
};

// Ordem da prescrição (spec): Tipo → Reps → Carga → RIR → Cadência.
const CHIPS = [
  { key: "planned_type", label: null },
  { key: "planned_repetitions", label: "Reps" },
  {
    key: "planned_weight",
    label: "Carga",
    format: (value) => `${formatWeight(value)} kg`,
  },
  { key: "planned_rir", label: "RIR" },
  { key: "planned_cadence", label: "Cadência" },
];

const chipClassName =
  "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs";

/**
 * Chips compactos com a prescrição ("alvo") da série. `keys` define quais
 * campos exibir: o exercício mostra o que é comum a todas as séries e cada série
 * só o que muda, evitando repetir a mesma informação em toda linha.
 */
export default function PrescriptionInfo({ set, keys, showLabel = true }) {
  const [showTechnique, setShowTechnique] = useState(false);

  const items = CHIPS.filter(
    (chip) => keys.includes(chip.key) && hasValue(set[chip.key]),
  );

  const technique = keys.includes("planned_advanced_technique")
    ? set.planned_advanced_technique
    : null;
  const techniqueDescription = technique
    ? TECHNIQUE_DESCRIPTIONS[technique]
    : null;

  if (items.length === 0 && !technique) return null;

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {showLabel ? (
          <span className="mr-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Alvo
          </span>
        ) : null}

        {items.map((chip) => (
          <span key={chip.key} className={chipClassName}>
            {chip.label ? (
              <span className="font-medium text-muted-foreground">
                {chip.label}
              </span>
            ) : null}
            <span
              className={cn(
                "font-mono font-semibold tabular-nums text-foreground",
                !chip.label && "uppercase tracking-wide",
              )}
            >
              {chip.format ? chip.format(set[chip.key]) : set[chip.key]}
            </span>
          </span>
        ))}

        {technique ? (
          techniqueDescription ? (
            <button
              type="button"
              onClick={() => setShowTechnique((open) => !open)}
              aria-expanded={showTechnique}
              className={cn(
                chipClassName,
                "transition-colors hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="font-medium text-muted-foreground">Técnica</span>
              <span className="font-semibold text-foreground">{technique}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform",
                  showTechnique && "rotate-180",
                )}
              />
            </button>
          ) : (
            <span className={chipClassName}>
              <span className="font-medium text-muted-foreground">Técnica</span>
              <span className="font-semibold text-foreground">{technique}</span>
            </span>
          )
        ) : null}
      </div>

      {showTechnique && techniqueDescription ? (
        <p className="rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {techniqueDescription}
        </p>
      ) : null}
    </div>
  );
}
