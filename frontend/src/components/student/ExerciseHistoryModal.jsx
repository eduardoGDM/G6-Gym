import { useInfiniteQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

import { Dialog, DialogCloseButton } from "../ui/dialog";
import ErrorState from "../loading/ErrorState";
import exerciseHistoryService from "../../services/ExerciseHistoryService";
import { formatDate } from "../../lib/format";

// Quantas sessões por página no modo log. O endpoint tem teto de 20.
const PER_PAGE = 10;

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

// Números vêm como decimal em string ("30.00"); exibimos no padrão pt-BR sem
// casas supérfluas.
const formatNumber = (value) => {
  if (!hasValue(value)) return null;
  const number = Number(value);
  return Number.isNaN(number)
    ? String(value)
    : number.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};

/**
 * Uma série executada, em uma linha de ficha: número, tipo, carga × reps e o
 * volume à direita. Sem card, sem chip arredondado — a linha é o objeto.
 */
function HistorySet({ set }) {
  const weight = formatNumber(set.performed_weight);
  const volume = formatNumber(set.volume);

  return (
    <div className="flex items-baseline gap-3 border-b border-border py-2 last:border-b-0">
      <span className="w-8 shrink-0 text-[11px] font-semibold text-muted-foreground ficha-mono">
        S{set.set_number}
      </span>

      <span className="w-24 shrink-0 truncate text-muted-foreground ficha-label">
        {set.type || "—"}
      </span>

      <span className="min-w-0 flex-1 text-[15px] ficha-mono">
        {hasValue(weight) ? `${weight} kg` : "—"}
        <span className="text-muted-foreground">
          {" × "}
          {hasValue(set.performed_repetitions) ? set.performed_repetitions : "—"}
        </span>
      </span>

      <span className="shrink-0 text-right text-[15px] font-semibold ficha-mono">
        {hasValue(volume) ? volume : "—"}
      </span>
    </div>
  );
}

/**
 * Uma sessão: a data, as séries daquele dia e o volume total movido.
 */
function HistoryEntry({ entry, index }) {
  const total = formatNumber(entry.total_volume);

  return (
    <section
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-2">
        <h3 className="text-[15px] font-semibold ficha-mono">
          {formatDate(entry.performed_at)}
        </h3>

        {hasValue(total) ? (
          <p className="text-right">
            <span className="text-[22px] ficha-display">{total}</span>
            <span className="ml-1.5 text-[11px] font-medium text-muted-foreground ficha-mono">
              kg movidos
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-1">
        {(entry.sets || []).map((set, setIndex) => (
          <HistorySet
            key={`${entry.checkin_id}-${set.set_number}-${setIndex}`}
            set={set}
          />
        ))}
      </div>

      {hasValue(entry.exercise_notes) ? (
        <p className="mt-3 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
          {entry.exercise_notes}
        </p>
      ) : null}
    </section>
  );
}

/**
 * Histórico executado de um exercício para o aluno: o log completo, paginado.
 *
 * Os dados são buscados apenas quando a modal abre (lazy) e vêm de página em
 * página com "Carregar mais" — nada é carregado junto do treino. O check-in em
 * edição fica de fora (`excludeCheckinId`): o aluno está fazendo aquele
 * exercício agora, então o registro de hoje não serve de referência.
 *
 * Uma sessão por bloco, com reps, carga, volume por série e o total do dia.
 */
export default function ExerciseHistoryModal({
  open,
  onClose,
  exerciseId,
  exerciseName,
  muscleGroup,
  excludeCheckinId,
}) {
  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["exercise-history-log", exerciseId, excludeCheckinId ?? null],
    queryFn: ({ pageParam }) =>
      exerciseHistoryService.history(exerciseId, {
        excludeCheckinId,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    initialPageParam: 1,
    // `meta` do paginator do Laravel: sem página seguinte, retorna undefined e
    // o react-query desliga o `hasNextPage`.
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (!meta || meta.current_page >= meta.last_page) return undefined;
      return meta.current_page + 1;
    },
    enabled: open && Boolean(exerciseId),
  });

  const entries = (data?.pages || []).flatMap((page) => page?.data || []);
  const total = data?.pages?.[0]?.meta?.total;

  const isInitialLoading = isFetching && entries.length === 0;
  const showError = isError && entries.length === 0;
  const isEmpty = !isFetching && !isError && entries.length === 0;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <DialogCloseButton onClick={onClose} />

      <div className="border-b-2 border-foreground px-6 pb-5 pt-6 sm:px-8">
        <p className="flex items-center gap-2 text-muted-foreground ficha-label">
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Histórico do exercício
        </p>

        <h2 className="mt-3 pr-10 text-[clamp(1.5rem,5vw,2.25rem)] ficha-display">
          {exerciseName || "Exercício"}
        </h2>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {muscleGroup ? (
            <span className="text-muted-foreground ficha-label">
              {muscleGroup}
            </span>
          ) : null}
          {total !== undefined && total > 0 ? (
            <span className="text-muted-foreground ficha-label">
              {total} {total === 1 ? "sessão registrada" : "sessões registradas"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto px-6 py-6 sm:px-8">
        {isInitialLoading ? (
          <div aria-hidden="true" className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-28 animate-pulse bg-muted" />
                <div className="h-3 w-full animate-pulse bg-muted" />
                <div className="h-3 w-3/4 animate-pulse bg-muted" />
              </div>
            ))}
          </div>
        ) : showError ? (
          <ErrorState
            title="Não foi possível carregar o histórico."
            description="Verifique sua conexão e tente novamente."
            onRetry={() => refetch()}
          />
        ) : isEmpty ? (
          <div className="py-6">
            <p className="text-[19px] font-medium">Nenhum histórico ainda</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Assim que você registrar este exercício, cada sessão aparece aqui
              com carga, repetições e volume.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-7">
              {entries.map((entry, index) => (
                <HistoryEntry
                  key={entry.checkin_id}
                  entry={entry}
                  index={index}
                />
              ))}
            </div>

            {hasNextPage ? (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-7 flex min-h-12 w-full items-center justify-center border-2 border-foreground text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ficha-mono hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-50"
              >
                {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </Dialog>
  );
}
