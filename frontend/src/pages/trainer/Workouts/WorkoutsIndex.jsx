import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Dumbbell,
  Eye,
  FileText,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { crudToast } from "../../../components/common/crudToast";
import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useWorkoutScope } from "../../../hooks/useWorkoutScope";
import { downloadBlob } from "../../../lib/download";
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
  const { scope, isStudent, basePath, canModify } = useWorkoutScope();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [togglingId, setTogglingId] = useState(null);
  const [generatingSheet, setGeneratingSheet] = useState(false);
  const confirmDelete = useConfirmDialog();

  const debouncedSearch = useDebouncedValue(search, 500);

  const [lastDebouncedSearch, setLastDebouncedSearch] =
    useState(debouncedSearch);
  if (debouncedSearch !== lastDebouncedSearch) {
    setLastDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "workouts",
      { scope, page, searchStudent: debouncedSearch, status, perPage },
    ],
    queryFn: () =>
      workoutsService.search({
        page,
        perPage,
        studentSearch: debouncedSearch,
        status,
        scope,
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

  const runDelete = async (id) => {
    try {
      await crudToast(workoutsService.remove(id, scope), {
        action: "delete",
        entity: "Treino",
      });
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    } catch {
      // erro já exibido pelo crudToast
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
        workoutsService.update(workout.id, { active: !workout.active }, scope),
        { action: "update", entity: "Treino" },
      );
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setTogglingId(null);
    }
  };

  const handleGenerateSheet = async () => {
    try {
      setGeneratingSheet(true);
      const pdfBlob = await workoutsService.generateMyWorkoutSheet();
      downloadBlob(pdfBlob, "ficha-treino.pdf");
    } catch {
      toast.error("Não foi possível gerar a ficha de treino.");
    } finally {
      setGeneratingSheet(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nome",
      className: "text-sm font-medium text-foreground",
      render: (workout) => (
        <>
          {workout.name}
          {!isStudent ? (
            <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
              {workout.student_profile?.user?.name || "—"}
            </p>
          ) : null}
        </>
      ),
    },
    // O aluno só enxerga os próprios treinos: a coluna de aluno não agrega.
    ...(isStudent
      ? []
      : [
          {
            key: "student",
            label: "Aluno",
            className: "hidden sm:table-cell",
            render: (workout) => workout.student_profile?.user?.name || "—",
          },
        ]),
    {
      key: "exercises_count",
      label: "Exercícios",
      className: "hidden lg:table-cell",
      render: (workout) => workout.exercises_count ?? 0,
    },
    {
      key: "start_date",
      label: "Data início",
      className: "hidden md:table-cell",
      render: (workout) => formatDateBR(workout.start_date),
    },
    {
      key: "status",
      label: "Status",
      render: (workout) => (
        <Badge
          className="gap-1.5"
          variant={workout.active ? "default" : "secondary"}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              workout.active ? "bg-success" : "bg-muted-foreground"
            }`}
          />
          {workout.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (workout) => (
        <div className="flex flex-wrap items-center gap-2">
          <ActionIconButton
            icon={Eye}
            tooltip="Visualizar"
            onClick={() => navigate(`${basePath}/${workout.id}`)}
          />
          {/* Treinos montados pelo personal ficam somente leitura para o aluno. */}
          {canModify(workout) ? (
            <>
              <ActionIconButton
                icon={Pencil}
                tooltip="Editar"
                onClick={() => navigate(`${basePath}/${workout.id}/edit`)}
              />
              <ActionIconButton
                icon={workout.active ? Pause : Play}
                tooltip={workout.active ? "Inativar treino" : "Ativar treino"}
                onClick={() => handleToggleStatus(workout)}
                loading={togglingId === workout.id}
              />
              <ActionIconButton
                icon={Trash2}
                tooltip="Excluir"
                color="destructive"
                onClick={() => confirmDelete.request(workout.id)}
                loading={
                  confirmDelete.loading && confirmDelete.target === workout.id
                }
              />
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Planejamento"
          title={isStudent ? "Gerenciar treinos" : "Treinos"}
          description={
            isStudent
              ? "Monte e ajuste seus próprios treinos. Os treinos criados pelo seu personal ficam disponíveis apenas para consulta."
              : "Monte e gerencie os treinos dos alunos."
          }
        />

        <div className="flex flex-col gap-2 md:flex-row">
          {isStudent ? (
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleGenerateSheet}
              disabled={generatingSheet}
            >
              <FileText className="h-4 w-4" />
              {generatingSheet ? "Gerando..." : "Gerar planilha"}
            </Button>
          ) : null}

          <Button
            className="w-full md:w-auto"
            onClick={() => navigate(`${basePath}/new`)}
          >
            <Plus className="h-4 w-4" />
            Novo treino
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {!isStudent ? (
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar aluno..."
              className="pl-10"
            />
          </div>
        ) : null}

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

      <DataTable
        className="mt-4"
        columns={columns}
        rows={workouts}
        loading={isLoading}
        fetching={isFetching}
        error={isError}
        onRetry={refetch}
        actionsCount={4}
        emptyIcon={Dumbbell}
        emptyTitle={
          debouncedSearch
            ? "Nenhum treino encontrado"
            : "Nenhum treino cadastrado"
        }
        emptyDescription={
          debouncedSearch
            ? "Tente buscar por outro nome de aluno."
            : "Cadastre um novo treino para começar a organizar as rotinas."
        }
        emptyAction={
          !debouncedSearch ? (
            <Button
              variant="outline"
              onClick={() => navigate(`${basePath}/new`)}
            >
              <Plus className="h-4 w-4" />
              Cadastrar treino
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

      <ConfirmDialog
        open={confirmDelete.open}
        title="Excluir treino"
        description="Deseja realmente excluir este treino? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        loading={confirmDelete.loading}
        onConfirm={() => confirmDelete.confirm(runDelete)}
        onCancel={confirmDelete.cancel}
      />
    </PageContainer>
  );
}
