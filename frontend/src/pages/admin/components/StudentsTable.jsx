import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserRoundX } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import DataTable from "../../../components/common/DataTable";
import { Badge } from "../../../components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import adminStudentsService from "../../../services/AdminStudentsService";
import StatusSwitch from "./StatusSwitch";

const PER_PAGE = 10;

function formatDateBR(dateString) {
  if (!dateString) return "—";
  const [year, month, day] = dateString.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default function StudentsTable() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ name: "", email: "", trainer: "" });
  const [page, setPage] = useState(1);

  const debouncedFilters = useDebouncedValue(filters, 500);

  const [lastFilters, setLastFilters] = useState(debouncedFilters);
  if (
    debouncedFilters.name !== lastFilters.name ||
    debouncedFilters.email !== lastFilters.email ||
    debouncedFilters.trainer !== lastFilters.trainer
  ) {
    setLastFilters(debouncedFilters);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-students", { page, ...debouncedFilters }],
    queryFn: () =>
      adminStudentsService.search({
        page,
        perPage: PER_PAGE,
        name: debouncedFilters.name,
        email: debouncedFilters.email,
        trainer: debouncedFilters.trainer,
      }),
    placeholderData: keepPreviousData,
  });

  const students = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleToggleStatus = async (student, nextStatus) => {
    try {
      await adminStudentsService.updateStatus(student.id, nextStatus);
      toast.success(
        nextStatus ? "Aluno ativado com sucesso" : "Aluno desativado com sucesso",
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Não foi possível atualizar o status do aluno.",
      );
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nome",
      className: "text-sm font-medium text-foreground",
      render: (student) => (
        <>
          {student.name}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {student.email}
          </p>
        </>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      className: "hidden sm:table-cell",
      render: (student) => student.email,
    },
    {
      key: "trainer",
      label: "Personal Responsável",
      className: "hidden md:table-cell",
      render: (student) => student.trainer_name || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (student) => (
        <Badge variant={student.is_active ? "default" : "secondary"}>
          {student.is_active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Cadastro",
      className: "hidden md:table-cell",
      render: (student) => formatDateBR(student.created_at),
    },
    {
      key: "actions",
      label: "Ações",
      render: (student) => (
        <StatusSwitch
          checked={student.is_active}
          confirmTitle={student.is_active ? "Desativar aluno?" : "Ativar aluno?"}
          confirmMessage={`Deseja realmente ${
            student.is_active ? "desativar" : "ativar"
          } o aluno ${student.name}?`}
          onConfirm={(next) => handleToggleStatus(student, next)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={students}
      loading={isLoading}
      fetching={isFetching}
      error={isError}
      onRetry={refetch}
      actionsCount={1}
      emptyIcon={UserRoundX}
      emptyTitle="Nenhum aluno encontrado"
      pagination={{
        summary: `${total} aluno(s) encontrado(s)`,
        page,
        lastPage,
        onPrev: () => setPage((current) => Math.max(1, current - 1)),
        onNext: () => setPage((current) => Math.min(lastPage, current + 1)),
      }}
      toolbar={
        <>
          <CardHeader>
            <CardTitle>Gerenciamento de Alunos</CardTitle>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.name}
                  onChange={handleFilterChange("name")}
                  placeholder="Buscar por nome..."
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.email}
                  onChange={handleFilterChange("email")}
                  placeholder="Buscar por e-mail..."
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.trainer}
                  onChange={handleFilterChange("trainer")}
                  placeholder="Buscar por personal..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </>
      }
    />
  );
}
