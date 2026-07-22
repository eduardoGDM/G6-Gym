import { ArrowDown, ArrowUp, Layers, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";

import { Field } from "../../../../components/forms/Field";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { DEFAULT_SERIES_TYPE } from "../utils";
import AddMultipleSeriesDialog from "./AddMultipleSeriesDialog";
import WorkoutSeriesCard from "./WorkoutSeriesCard";

const emptySeries = {
  repetitions: "",
  weight: "",
  rest_time: "",
  rir: "",
  type: DEFAULT_SERIES_TYPE,
  advanced_technique: "",
  tempo: "",
  cadence: "",
  duration: "",
  notes: "",
};

export default function WorkoutExerciseCard({
  control,
  register,
  index,
  exercise,
  errors,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const {
    fields: seriesFields,
    append: appendSeries,
    remove: removeSeries,
  } = useFieldArray({
    control,
    name: `exercises.${index}.series`,
  });

  const [multipleDialogOpen, setMultipleDialogOpen] = useState(false);

  // Rola até a primeira série recém-criada, sem tirar o foco do formulário.
  const scrollToSeries = (seriesIndex) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById(`exercises.${index}.series.${seriesIndex}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  };

  const handleAddMultipleSeries = (quantity) => {
    const firstNewIndex = seriesFields.length;
    // Mesma lógica do botão "Adicionar série", executada N vezes em uma
    // única atualização de estado (append aceita um array).
    appendSeries(
      Array.from({ length: quantity }, () => ({ ...emptySeries })),
      { shouldFocus: false },
    );
    setMultipleDialogOpen(false);
    scrollToSeries(firstNewIndex);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {exercise?.name || "Exercício"}
            </p>
            <p className="text-xs text-muted-foreground">
              {exercise?.muscle_group?.name || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Field
        label="Observação geral do exercício"
        htmlFor={`exercises.${index}.notes`}
      >
        <Textarea
          id={`exercises.${index}.notes`}
          rows={1}
          autoResize
          placeholder="Instruções válidas para todas as séries (opcional)"
          {...register(`exercises.${index}.notes`)}
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Séries ({seriesFields.length})
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSeries({ ...emptySeries })}
            >
              <Plus className="h-4 w-4" />
              Adicionar série
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMultipleDialogOpen(true)}
            >
              <Layers className="h-4 w-4" />
              Adicionar múltiplas séries
            </Button>
          </div>
        </div>

        {seriesFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma série adicionada. Use o botão acima para detalhar este
            exercício, se desejar.
          </p>
        ) : (
          <div className="space-y-3">
            {seriesFields.map((field, seriesIndex) => (
              <WorkoutSeriesCard
                key={field.id}
                register={register}
                namePrefix={`exercises.${index}.series.${seriesIndex}`}
                seriesNumber={seriesIndex + 1}
                errors={errors?.series?.[seriesIndex]}
                onRemove={() => removeSeries(seriesIndex)}
              />
            ))}
          </div>
        )}
      </div>

      {multipleDialogOpen ? (
        <AddMultipleSeriesDialog
          onClose={() => setMultipleDialogOpen(false)}
          onConfirm={handleAddMultipleSeries}
        />
      ) : null}
    </div>
  );
}
