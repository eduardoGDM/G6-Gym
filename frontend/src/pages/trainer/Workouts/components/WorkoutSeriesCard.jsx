import { Trash2 } from "lucide-react";

import { Field } from "../../../../components/forms/Field";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";

export default function WorkoutSeriesCard({
  register,
  namePrefix,
  seriesNumber,
  errors,
  onRemove,
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">
          Série {seriesNumber}
        </span>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Repetições"
          htmlFor={`${namePrefix}.repetitions`}
          error={errors?.repetitions?.message}
        >
          <Input
            id={`${namePrefix}.repetitions`}
            type="number"
            min="0"
            placeholder="Ex: 12"
            {...register(`${namePrefix}.repetitions`)}
          />
        </Field>

        <Field
          label="Carga (kg)"
          htmlFor={`${namePrefix}.weight`}
          error={errors?.weight?.message}
        >
          <Input
            id={`${namePrefix}.weight`}
            type="number"
            min="0"
            step="0.5"
            placeholder="Ex: 20"
            {...register(`${namePrefix}.weight`)}
          />
        </Field>

        <Field
          label="Descanso (s)"
          htmlFor={`${namePrefix}.rest_time`}
          error={errors?.rest_time?.message}
        >
          <Input
            id={`${namePrefix}.rest_time`}
            type="number"
            min="0"
            placeholder="Ex: 60"
            {...register(`${namePrefix}.rest_time`)}
          />
        </Field>

        <Field
          label="RIR"
          htmlFor={`${namePrefix}.rir`}
          error={errors?.rir?.message}
        >
          <Input
            id={`${namePrefix}.rir`}
            type="number"
            min="0"
            max="10"
            placeholder="Ex: 2"
            {...register(`${namePrefix}.rir`)}
          />
        </Field>

        <Field
          label="Tempo"
          htmlFor={`${namePrefix}.tempo`}
          error={errors?.tempo?.message}
        >
          <Input
            id={`${namePrefix}.tempo`}
            placeholder="Ex: 3-1-1"
            {...register(`${namePrefix}.tempo`)}
          />
        </Field>

        <Field
          label="Cadência"
          htmlFor={`${namePrefix}.cadence`}
          error={errors?.cadence?.message}
        >
          <Input
            id={`${namePrefix}.cadence`}
            placeholder="Ex: lenta"
            {...register(`${namePrefix}.cadence`)}
          />
        </Field>

        <Field
          label="Duração (s)"
          htmlFor={`${namePrefix}.duration`}
          error={errors?.duration?.message}
        >
          <Input
            id={`${namePrefix}.duration`}
            type="number"
            min="0"
            placeholder="Ex: 30"
            {...register(`${namePrefix}.duration`)}
          />
        </Field>
      </div>

      <Field label="Observação da série" htmlFor={`${namePrefix}.notes`}>
        <Textarea
          id={`${namePrefix}.notes`}
          rows={1}
          autoResize
          placeholder="Observação desta série (opcional)"
          {...register(`${namePrefix}.notes`)}
        />
      </Field>
    </div>
  );
}
