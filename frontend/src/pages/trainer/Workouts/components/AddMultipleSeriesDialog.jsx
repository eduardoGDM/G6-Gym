import { Layers } from "lucide-react";
import { useState } from "react";

import { Field } from "../../../../components/forms/Field";
import { Button } from "../../../../components/ui/button";
import { Dialog } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";

const MIN_SERIES = 1;
const MAX_SERIES = 20;

const clamp = (value) => Math.min(MAX_SERIES, Math.max(MIN_SERIES, value));

// O componente é montado apenas enquanto aberto (ver WorkoutExerciseCard),
// então o estado local reinicia naturalmente a cada abertura.
export default function AddMultipleSeriesDialog({ onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(String(MIN_SERIES));

  const parsed = Number.parseInt(quantity, 10);
  const isValid = Number.isInteger(parsed) && parsed >= MIN_SERIES && parsed <= MAX_SERIES;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(clamp(parsed));
  };

  return (
    <Dialog open onClose={onClose} className="max-w-sm p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Layers className="h-5 w-5" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Adicionar múltiplas séries
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Informe quantas séries deseja criar de uma vez (mínimo {MIN_SERIES},
        máximo {MAX_SERIES}). Elas serão criadas com os valores padrão.
      </p>

      <div className="mt-4">
        <Field label="Quantidade de séries" htmlFor="multiple-series-quantity">
          <Input
            id="multiple-series-quantity"
            type="number"
            min={MIN_SERIES}
            max={MAX_SERIES}
            step="1"
            autoFocus
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleConfirm();
              }
            }}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={!isValid}>
          Criar
        </Button>
      </div>
    </Dialog>
  );
}
