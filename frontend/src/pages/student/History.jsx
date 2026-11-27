import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import TapeDivider from "../../components/ficha/TapeDivider";
import ErrorState from "../../components/loading/ErrorState";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { cn } from "../../lib/utils";
import { formatDate } from "../../lib/format";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";

/**
 * Histórico de treinos no tema "A Ficha": o caderno.
 *
 * Cada sessão é uma linha sobre a pauta — data em mono à esquerda, treino no
 * meio, contagem em número tabular à direita. Sem card por item, sem ícone
 * decorativo em caixa arredondada: a lista é o objeto.
 */
export default function History() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const debouncedSearch = useDebouncedValue(search, 500);

  const [lastDebouncedSearch, setLastDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== lastDebouncedSearch) {
    setLastDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["student-history", { page, search: debouncedSearch, perPage }],
    queryFn: () =>
      workoutCheckinsService.history({
        page,
        perPage,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar o histórico.");
    }
  }, [isError]);

  const checkins = data?.data || [];
  const meta = data?.meta;
  const lastPage = meta?.last_page || 1;
  const total = meta?.total;

  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="border-b-2 border-foreground pb-6 pt-8">
        <p className="text-muted-foreground ficha-label">
          Histórico · todos os check-ins registrados
        </p>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="min-w-0">
            <h1 className="break-words text-[clamp(2.25rem,8vw,5.5rem)] ficha-display">
              O caderno
            </h1>
            {total !== undefined && !debouncedSearch ? (
              <p className="mt-4 text-[13px] uppercase tracking-[0.16em] ficha-mono">
                {total}
                <span className="text-muted-foreground">
                  {" "}
                  {total === 1 ? "sessão registrada" : "sessões registradas"}
                </span>
              </p>
            ) : null}
          </div>

          {/* Busca em linha de ficha: sublinhado, não caixa. */}
          <div className="relative w-full max-w-sm">
            <label
              htmlFor="history-search"
              className="block text-muted-foreground ficha-label"
            >
              Buscar por data
            </label>
            <div className="relative mt-2 flex items-center border-b-2 border-foreground focus-within:border-primary">
              <Search
                aria-hidden="true"
                className="pointer-events-none h-4 w-4 shrink-0 text-muted-foreground"
              />
              <input
                id="history-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="DD/MM/AAAA"
                className="min-h-11 w-full min-w-0 border-0 bg-transparent px-2.5 text-[15px] outline-none ficha-mono placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="mt-10 border-t border-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-16 items-center border-b border-border"
            >
              <span className="h-4 w-56 animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-10 border-2 border-border bg-card p-6">
          <ErrorState onRetry={refetch} />
        </div>
      ) : checkins.length === 0 ? (
        <div className="mt-10">
          <TapeDivider className="mb-7" />
          <p className="text-[19px] font-medium">
            {debouncedSearch
              ? "Nenhum check-in encontrado para esta data"
              : "Nenhum check-in registrado ainda"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {debouncedSearch
              ? "Tente pesquisar por outra data."
              : "Assim que você concluir um treino, ele aparece aqui — com carga, repetições e volume."}
          </p>
        </div>
      ) : (
        <>
          <ul
            className={cn(
              "mt-10 border-t border-border transition-opacity duration-200",
              isFetching && "opacity-60",
            )}
          >
            {checkins.map((checkin, index) => (
              <li key={checkin.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/student/history/${checkin.id}`)}
                  className="flex h-16 w-full animate-rise items-end gap-3 border-b border-border pb-[9px] pr-1 text-left transition-colors duration-200 ficha-ruled hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:pr-2.5"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span className="w-[86px] shrink-0 text-xs text-muted-foreground ficha-mono">
                    {formatDate(checkin.performed_at)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[17px] font-medium">
                    {checkin.workout?.name || "Treino removido"}
                  </span>
                  {/* A unidade só entra quando sobra largura — em 360px ela
                      roubava o nome do treino. */}
                  <span className="w-10 shrink-0 text-right text-[26px] ficha-display sm:w-20">
                    {checkin.exercises_count ?? 0}
                  </span>
                  <span className="hidden w-14 shrink-0 text-xs text-muted-foreground ficha-mono sm:block">
                    exerc.
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="min-h-11 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            >
              ← Anterior
            </button>

            <span className="text-muted-foreground ficha-label">
              Folha {page} de {lastPage}
            </span>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
              className="min-h-11 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </>
      )}

      <footer className="mt-20 border-t border-border pt-7">
        <p className="max-w-[620px] text-[21px] leading-[1.5] ficha-hand">
          O que está anotado aconteceu. O resto é memória.
        </p>
      </footer>
    </PageContainer>
  );
}
