import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import exercisesService from "../../../services/ExercisesService";

const PER_PAGE_OPTIONS = [10, 25, 50];

export default function ExercisesIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 500);

  const [lastDebouncedSearch, setLastDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== lastDebouncedSearch) {
    setLastDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["exercises", { page, search: debouncedSearch, perPage }],
    queryFn: () =>
      exercisesService.search({ page, perPage, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar os exercícios.");
    }
  }, [isError]);

  const exercises = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este exercício?")) {
      return;
    }

    try {
      setDeletingId(id);
      await crudToast(exercisesService.remove(id), {
        action: "delete",
        entity: "Exercício",
      });
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
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

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Catálogo"
          title="Exercícios"
          description="Mantenha sua base de exercícios organizada e fácil de consultar."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/exercises/new")}
        >
          <Plus className="h-4 w-4" />
          Novo exercício
        </Button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar exercício..."
          className="pl-10"
        />
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {isLoading ? (
          <CardContent className="py-4">
            <PageLoader label="Carregando exercícios..." />
          </CardContent>
        ) : exercises.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {debouncedSearch
                  ? "Nenhum exercício encontrado"
                  : "Nenhum exercício cadastrado"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Tente buscar por outro nome ou grupo muscular."
                  : "Adicione exercícios para montar treinos mais completos."}
              </p>
            </div>
            {!debouncedSearch ? (
              <Button
                variant="outline"
                onClick={() => navigate("/trainer/exercises/new")}
              >
                <Plus className="h-4 w-4" />
                Cadastrar exercício
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
                      Grupo muscular
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Equipamento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card/70">
                  {exercises.map((exercise) => (
                    <tr
                      key={exercise.id}
                      className="transition-colors hover:bg-muted/10"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {exercise.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {exercise.muscle_group?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {exercise.equipment || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <ActionIconButton
                            icon={Eye}
                            tooltip="Visualizar"
                            onClick={() =>
                              navigate(`/trainer/exercises/${exercise.id}`)
                            }
                          />
                          <ActionIconButton
                            icon={Pencil}
                            tooltip="Editar"
                            onClick={() =>
                              navigate(`/trainer/exercises/${exercise.id}/edit`)
                            }
                          />
                          <ActionIconButton
                            icon={Trash2}
                            tooltip="Excluir"
                            color="destructive"
                            onClick={() => handleDelete(exercise.id)}
                            loading={deletingId === exercise.id}
                          />
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
