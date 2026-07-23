import { Trash2 } from "lucide-react";

import { Field } from "../../../../components/forms/Field";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import {
  ADVANCED_TECHNIQUES,
  CADENCE_MAX_LENGTH,
  REPETITIONS_PLACEHOLDER,
  RIR_OPTIONS,
  SERIES_TYPES,
} from "../utils";

export default function WorkoutSeriesCard({
  register,
  namePrefix,
  seriesNumber,
  errors,
  onRemove,
}) {
  return (
    <div
      id={namePrefix}
      className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4"
    >
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
          label="Tipo"
          htmlFor={`${namePrefix}.type`}
          error={errors?.type?.message}
        >
          <Select id={`${namePrefix}.type`} {...register(`${namePrefix}.type`)}>
            {SERIES_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Repetições"
          htmlFor={`${namePrefix}.repetitions`}
          error={errors?.repetitions?.message}
        >
          <div className="space-y-1">
            <Input
              id={`${namePrefix}.repetitions`}
              placeholder={REPETITIONS_PLACEHOLDER}
              {...register(`${namePrefix}.repetitions`)}
            />
          </div>
        </Field>

        <Field
          label="RIR"
          htmlFor={`${namePrefix}.rir`}
          error={errors?.rir?.message}
        >
          <Select id={`${namePrefix}.rir`} {...register(`${namePrefix}.rir`)}>
            <option value="">Não informado</option>
            {RIR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Técnica avançada"
          htmlFor={`${namePrefix}.advanced_technique`}
          error={errors?.advanced_technique?.message}
        >
          <Select
            id={`${namePrefix}.advanced_technique`}
            {...register(`${namePrefix}.advanced_technique`)}
          >
            <option value="">Nenhuma</option>
            {ADVANCED_TECHNIQUES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Cadência"
          htmlFor={`${namePrefix}.cadence`}
          error={errors?.cadence?.message}
        >
          <Input
            id={`${namePrefix}.cadence`}
            maxLength={CADENCE_MAX_LENGTH}
            placeholder="Ex: 3s exc / 1s conc"
            {...register(`${namePrefix}.cadence`)}
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
            inputMode="numeric"
            placeholder="Ex: 60"
            {...register(`${namePrefix}.rest_time`)}
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
            inputMode="decimal"
            placeholder="Ex: 20"
            {...register(`${namePrefix}.weight`)}
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
            inputMode="numeric"
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
