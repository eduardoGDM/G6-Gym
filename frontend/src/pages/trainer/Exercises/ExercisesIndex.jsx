import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import { crudToast } from "../../../components/common/crudToast";
import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
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

  const columns = [
    {
      key: "name",
      label: "Nome",
      className: "text-sm font-medium text-foreground",
      render: (exercise) => (
        <>
          {exercise.name}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {exercise.muscle_group?.name || "—"}
          </p>
        </>
      ),
    },
    {
      key: "muscle_group",
      label: "Grupo muscular",
      className: "hidden sm:table-cell",
      render: (exercise) => exercise.muscle_group?.name || "—",
    },
    {
      key: "equipment",
      label: "Equipamento",
      className: "hidden md:table-cell",
      render: (exercise) => exercise.equipment || "—",
    },
    {
      key: "actions",
      label: "Ações",
      render: (exercise) => (
        <div className="flex flex-wrap items-center gap-2">
          <ActionIconButton
            icon={Eye}
            tooltip="Visualizar"
            onClick={() => navigate(`/trainer/exercises/${exercise.id}`)}
          />
          <ActionIconButton
            icon={Pencil}
            tooltip="Editar"
            onClick={() => navigate(`/trainer/exercises/${exercise.id}/edit`)}
          />
          <ActionIconButton
            icon={Trash2}
            tooltip="Excluir"
            color="destructive"
            onClick={() => handleDelete(exercise.id)}
            loading={deletingId === exercise.id}
          />
        </div>
      ),
    },
  ];

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

      <DataTable
        className="mt-4"
        columns={columns}
        rows={exercises}
        loading={isLoading}
        fetching={isFetching}
        error={isError}
        onRetry={refetch}
        actionsCount={3}
        emptyIcon={Dumbbell}
        emptyTone="secondary"
        emptyTitle={
          debouncedSearch ? "Nenhum exercício encontrado" : "Nenhum exercício cadastrado"
        }
        emptyDescription={
          debouncedSearch
            ? "Tente buscar por outro nome ou grupo muscular."
            : "Adicione exercícios para montar treinos mais completos."
        }
        emptyAction={
          !debouncedSearch ? (
            <Button variant="outline" onClick={() => navigate("/trainer/exercises/new")}>
              <Plus className="h-4 w-4" />
              Cadastrar exercício
            </Button>
          ) : null
        }
        pagination={{
          summary: `${from}–${to} de ${total}`,
          page,
          lastPage,
          onPrev: () => setPage((current) => Math.max(1, current - 1)),
          onNext: () => setPage((current) => Math.min(lastPage, current + 1)),
          perPage,
          perPageOptions: PER_PAGE_OPTIONS,
          onPerPageChange: handlePerPageChange,
        }}
      />
    </PageContainer>
  );
}
