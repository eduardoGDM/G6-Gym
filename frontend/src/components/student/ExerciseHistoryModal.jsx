import { useQuery } from "@tanstack/react-query";
import { CalendarDays, History } from "lucide-react";

import { Badge } from "../ui/badge";
import { Dialog, DialogCloseButton } from "../ui/dialog";
import ErrorState from "../loading/ErrorState";
import ListSkeleton from "../loading/ListSkeleton";
import exerciseHistoryService from "../../services/ExerciseHistoryService";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

// Carga vem como decimal em string ("30.00"); exibimos sem casas supérfluas.
const formatWeight = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isNaN(number) ? value : String(number);
};

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

/**
 * Linha rótulo/valor compacta usada dentro do card da série. Só renderiza quando
 * há valor, evitando poluição visual quando o dado não foi informado.
 */
function DetailRow({ label, value }) {
  if (!hasValue(value)) return null;

  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

/**
 * Card compacto de uma série executada — sem tabelas, só rótulo/valor e chips.
 */
function HistorySet({ set }) {
  const weight = formatWeight(set.performed_weight);

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          Série {set.set_number}
        </span>
        {set.type ? (
          <Badge
            variant="secondary"
            className="uppercase tracking-wide text-[0.65rem]"
          >
            {set.type}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <DetailRow label="Carga" value={hasValue(weight) ? `${weight} kg` : null} />
        <DetailRow label="Repetições" value={set.performed_repetitions} />
        <DetailRow label="RIR" value={set.rir} />
        <DetailRow label="Cadência" value={set.cadence} />
        <DetailRow label="Técnica" value={set.advanced_technique} />
      </div>

      {hasValue(set.notes) ? (
        <p className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {set.notes}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Uma execução (check-in): cabeçalho com a data e a grade de séries realizadas.
 */
function HistoryEntry({ entry }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          {formatDate(entry.performed_at)}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(entry.sets || []).map((set, index) => (
          <HistorySet key={`${entry.checkin_id}-${set.set_number}-${index}`} set={set} />
        ))}
      </div>

      {hasValue(entry.exercise_notes) ? (
        <p className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Observação: </span>
          {entry.exercise_notes}
        </p>
      ) : null}
    </section>
  );
}

/**
 * Modal reutilizável com o histórico executado de um exercício para o aluno.
 * Os dados são buscados apenas quando a modal abre (lazy) e paginados de forma
 * incremental ("Carregar mais"), para não impactar o carregamento do treino.
 */
export default function ExerciseHistoryModal({
  open,
  onClose,
  exerciseId,
  exerciseName,
  muscleGroup,
}) {
  // Busca só quando a modal está aberta (enabled) — nada é carregado junto do
  // treino. O endpoint já devolve apenas as últimas execuções do exercício.
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["exercise-history", exerciseId],
    queryFn: () => exerciseHistoryService.history(exerciseId),
    enabled: open && Boolean(exerciseId),
  });

  const entries = data?.data ?? [];

  const isInitialLoading = isFetching && entries.length === 0;
  const showError = isError && entries.length === 0;
  const isEmpty = !isFetching && !isError && entries.length === 0;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <DialogCloseButton onClick={onClose} />

      <div className="border-b border-border/80 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <History className="h-4 w-4" />
          Histórico do exercício
        </div>
        <h2 className="mt-1 pr-10 text-xl font-bold text-foreground">
          {exerciseName || "Exercício"}
        </h2>
        {muscleGroup ? (
          <Badge variant="outline" className="mt-2">
            {muscleGroup}
          </Badge>
        ) : null}
      </div>

      <div className="max-h-[65vh] overflow-auto px-6 py-6 sm:px-8">
        {isInitialLoading ? (
          <ListSkeleton count={2} columns="" lines={4} />
        ) : showError ? (
          <ErrorState
            title="Não foi possível carregar o histórico."
            description="Verifique sua conexão e tente novamente."
            onRetry={() => refetch()}
          />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Nenhum histórico ainda
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Assim que você registrar este exercício, ele aparecerá aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <HistoryEntry key={entry.checkin_id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
