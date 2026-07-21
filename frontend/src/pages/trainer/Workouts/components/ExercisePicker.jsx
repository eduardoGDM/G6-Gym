import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import Spinner from "../../../../components/common/Spinner";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import exercisesService from "../../../../services/ExercisesService";

const PER_PAGE = 8;

export default function ExercisePicker({ muscleGroups = [], addedIds = [], onAdd }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 500);

  const filtersKey = `${debouncedSearch}|${[...muscleGroups].sort().join(",")}`;
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);

  if (filtersKey !== lastFiltersKey) {
    setLastFiltersKey(filtersKey);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "exercises",
      { search: debouncedSearch, page, perPage: PER_PAGE, muscleGroups },
    ],
    queryFn: () =>
      exercisesService.search({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        muscleGroups,
      }),
    placeholderData: keepPreviousData,
  });

  const exercises = data?.data || [];
  const meta = data?.meta;
  const lastPage = meta?.last_page || 1;
  const addedIdsAsStrings = addedIds.map(String);

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-background/60 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar exercício..."
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-sm text-destructive">
          Não foi possível carregar os exercícios.
        </p>
      ) : exercises.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum exercício encontrado para os filtros selecionados.
        </p>
      ) : (
        <div
          className={`space-y-1.5 transition-opacity ${isFetching ? "opacity-60" : ""}`}
        >
          {exercises.map((exercise) => {
            const alreadyAdded = addedIdsAsStrings.includes(String(exercise.id));

            return (
              <div
                key={exercise.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {exercise.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.muscle_group?.name || "—"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={alreadyAdded}
                  onClick={() => onAdd(exercise)}
                >
                  <Plus className="h-4 w-4" />
                  {alreadyAdded ? "Adicionado" : "Adicionar"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 ? (
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page} de {lastPage}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
