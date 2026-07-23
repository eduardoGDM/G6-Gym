import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DERIVED_FIELDS,
  formatAssessmentDate,
  formatMeasureValue,
  getMeasureLabel,
} from "./fields";

/**
 * Variação em relação à avaliação anterior. Sem cor de "bom/ruim": perder peso
 * ou ganhar circunferência só é positivo ou negativo em função do objetivo do
 * aluno, que a avaliação não conhece.
 */
export function Delta({ delta }) {
  if (delta === null || delta === undefined || delta === 0) return null;

  const Icon = delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {formatMeasureValue(Math.abs(delta))}
    </span>
  );
}

function MeasureCell({ label, entry }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {formatMeasureValue(entry.value)}
        <Delta delta={entry.delta} />
      </p>
    </div>
  );
}

/**
 * Card de uma avaliação física. Puramente apresentacional: as ações de editar e
 * excluir só aparecem quando os respectivos callbacks são passados (tela do
 * personal); a tela do aluno é leitura pura.
 */
export default function AssessmentCard({
  assessment,
  isLatest = false,
  onEdit,
  onDelete,
}) {
  const filledMeasures = Object.entries(assessment.measures).filter(
    ([, entry]) => entry.value !== null,
  );
  const filledDerived = DERIVED_FIELDS.filter(
    (field) => assessment.derived[field.name].value !== null,
  );

  return (
    <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">
              {formatAssessmentDate(assessment.assessment_date)}
            </p>
            {isLatest ? <Badge variant="secondary">Mais recente</Badge> : null}
          </div>
          {assessment.trainer?.name ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Avaliação realizada por {assessment.trainer.name}
            </p>
          ) : null}
        </div>

        {onEdit || onDelete ? (
          <div className="flex gap-2">
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(assessment)}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(assessment)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {filledDerived.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {filledDerived.map((field) => (
            <div
              key={field.name}
              className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2"
            >
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {formatMeasureValue(assessment.derived[field.name].value)}
                <Delta delta={assessment.derived[field.name].delta} />
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {filledMeasures.length ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {filledMeasures.map(([name, entry]) => (
            <MeasureCell key={name} label={getMeasureLabel(name)} entry={entry} />
          ))}
        </div>
      ) : null}

      {assessment.notes ? (
        <p className="mt-4 whitespace-pre-line rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
          {assessment.notes}
        </p>
      ) : null}
    </div>
  );
}
