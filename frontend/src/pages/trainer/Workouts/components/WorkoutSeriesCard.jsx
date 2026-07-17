import { Trash2 } from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
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
        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.repetitions`}>Repetições</Label>
          <Input
            id={`${namePrefix}.repetitions`}
            type="number"
            min="0"
            placeholder="Ex: 12"
            {...register(`${namePrefix}.repetitions`)}
          />
          {errors?.repetitions ? (
            <p className="text-sm text-red-400">
              {errors.repetitions.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.weight`}>Carga (kg)</Label>
          <Input
            id={`${namePrefix}.weight`}
            type="number"
            min="0"
            step="0.5"
            placeholder="Ex: 20"
            {...register(`${namePrefix}.weight`)}
          />
          {errors?.weight ? (
            <p className="text-sm text-red-400">{errors.weight.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.rest_time`}>Descanso (s)</Label>
          <Input
            id={`${namePrefix}.rest_time`}
            type="number"
            min="0"
            placeholder="Ex: 60"
            {...register(`${namePrefix}.rest_time`)}
          />
          {errors?.rest_time ? (
            <p className="text-sm text-red-400">
              {errors.rest_time.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.rir`}>RIR</Label>
          <Input
            id={`${namePrefix}.rir`}
            type="number"
            min="0"
            max="10"
            placeholder="Ex: 2"
            {...register(`${namePrefix}.rir`)}
          />
          {errors?.rir ? (
            <p className="text-sm text-red-400">{errors.rir.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.tempo`}>Tempo</Label>
          <Input
            id={`${namePrefix}.tempo`}
            placeholder="Ex: 3-1-1"
            {...register(`${namePrefix}.tempo`)}
          />
          {errors?.tempo ? (
            <p className="text-sm text-red-400">{errors.tempo.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.cadence`}>Cadência</Label>
          <Input
            id={`${namePrefix}.cadence`}
            placeholder="Ex: lenta"
            {...register(`${namePrefix}.cadence`)}
          />
          {errors?.cadence ? (
            <p className="text-sm text-red-400">{errors.cadence.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${namePrefix}.duration`}>Duração (s)</Label>
          <Input
            id={`${namePrefix}.duration`}
            type="number"
            min="0"
            placeholder="Ex: 30"
            {...register(`${namePrefix}.duration`)}
          />
          {errors?.duration ? (
            <p className="text-sm text-red-400">{errors.duration.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${namePrefix}.notes`}>Observação da série</Label>
        <Textarea
          id={`${namePrefix}.notes`}
          rows={1}
          autoResize
          placeholder="Observação desta série (opcional)"
          {...register(`${namePrefix}.notes`)}
        />
      </div>
    </div>
  );
}
