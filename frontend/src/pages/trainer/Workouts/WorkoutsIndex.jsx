import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Eye, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import workoutsService from "../../../services/WorkoutsService";

const PER_PAGE_OPTIONS = [10, 25, 50];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

function formatDateBR(dateString) {
  if (!dateString) return "—";
  const [year, month, day] = dateString.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default function WorkoutsIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 500);

  const [lastDebouncedSearch, setLastDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== lastDebouncedSearch) {
    setLastDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "workouts",
      { page, searchStudent: debouncedSearch, status, perPage },
    ],
    queryFn: () =>
      workoutsService.search({
        page,
        perPage,
        studentSearch: debouncedSearch,
        status,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar os treinos.");
    }
  }, [isError]);

  const workouts = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este treino?")) {
      return;
    }

    try {
      setDeletingId(id);
      await crudToast(workoutsService.remove(id), {
        action: "delete",
        entity: "Treino",
      });
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setDeletingId(null);
    }
  };

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleToggleStatus = async (workout) => {
    try {
      setTogglingId(workout.id);
      await crudToast(
        workoutsService.update(workout.id, { active: !workout.active }),
        { action: "update", entity: "Treino" },
      );
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Planejamento"
          title="Treinos"
          description="Monte e gerencie os treinos dos alunos."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/workouts/new")}
        >
          <Plus className="h-4 w-4" />
          Novo treino
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aluno..."
            className="pl-10"
          />
        </div>

        <Select
          className="sm:w-48"
          value={status}
          onChange={handleStatusChange}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {isLoading ? (
          <CardContent className="py-4">
            <PageLoader label="Carregando treinos..." />
          </CardContent>
        ) : workouts.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {debouncedSearch
                  ? "Nenhum treino encontrado"
                  : "Nenhum treino cadastrado"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Tente buscar por outro nome de aluno."
                  : "Cadastre um novo treino para começar a organizar as rotinas."}
              </p>
            </div>
            {!debouncedSearch ? (
              <Button
                variant="outline"
                onClick={() => navigate("/trainer/workouts/new")}
              >
                <Plus className="h-4 w-4" />
                Cadastrar treino
              </Button>
            ) : null}
          </CardContent>
        ) : (
          <>
            <CardContent
              className={`animate-in fade-in duration-300 overflow-x-auto p-0 transition-opacity ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              <table className="min-w-full divide-y divide-border/70">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Aluno
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Exercícios
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Data início
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card/70">
                  {workouts.map((workout) => (
                    <tr
                      key={workout.id}
                      className="transition-colors hover:bg-muted/10"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {workout.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {workout.student_profile?.user?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {workout.exercises_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateBR(workout.start_date)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className="gap-1.5"
                          variant={workout.active ? "default" : "secondary"}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              workout.active ? "bg-green-400" : "bg-gray-400"
                            }`}
                          />
                          {workout.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/trainer/workouts/${workout.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/trainer/workouts/${workout.id}/edit`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(workout)}
                            disabled={togglingId === workout.id}
                          >
                            {togglingId === workout.id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                            {workout.active ? "Inativar treino" : "Ativar treino"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(workout.id)}
                            disabled={deletingId === workout.id}
                          >
                            {deletingId === workout.id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {deletingId === workout.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>

            <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Exibir</span>
                <Select
                  className="!h-9 w-20"
                  value={perPage}
                  onChange={handlePerPageChange}
                >
                  {PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <span>
                  {from}–{to} de {total}
                </span>
              </div>

              <div className="flex items-center gap-2">
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
            </div>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
