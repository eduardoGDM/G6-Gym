import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageLoader from "../../components/common/PageLoader";
import PageTitle from "../../components/common/PageTitle";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

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

  const { data, isLoading, isFetching, isError } = useQuery({
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

  return (
    <PageContainer>
      <PageTitle
        eyebrow="Evolução"
        title="Histórico de treinos"
        description="Veja todos os check-ins que você já registrou."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por data (DD/MM/AAAA)..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="mt-4 border-border/80 bg-card/80">
          <CardContent className="py-4">
            <PageLoader label="Carregando histórico..." />
          </CardContent>
        </Card>
      ) : checkins.length === 0 ? (
        <Card className="mt-4 border-border/80 bg-card/80">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">
                {debouncedSearch
                  ? "Nenhum check-in encontrado para esta data"
                  : "Nenhum check-in registrado ainda"}
              </p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Tente pesquisar por outra data."
                  : "Assim que você concluir um treino, ele aparecerá aqui."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={`mt-4 grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {checkins.map((checkin) => (
              <Card
                key={checkin.id}
                className="flex flex-col border-border/80 bg-card/80"
              >
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      {checkin.workout?.name || "Treino removido"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(checkin.performed_at)}
                    </p>
                  </div>

                  <Badge variant="outline" className="w-fit">
                    {checkin.exercises_count ?? 0}{" "}
                    {checkin.exercises_count === 1 ? "exercício" : "exercícios"}
                  </Badge>

                  <Button
                    variant="outline"
                    className="mt-auto w-full"
                    onClick={() => navigate(`/student/history/${checkin.id}`)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
