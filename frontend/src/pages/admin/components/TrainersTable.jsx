import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserRoundX } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import DataTable from "../../../components/common/DataTable";
import { Badge } from "../../../components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import adminTrainersService from "../../../services/AdminTrainersService";
import StatusSwitch from "./StatusSwitch";

const PER_PAGE = 10;

function formatDateBR(dateString) {
  if (!dateString) return "—";
  const [year, month, day] = dateString.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default function TrainersTable() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ name: "", email: "" });
  const [page, setPage] = useState(1);

  const debouncedFilters = useDebouncedValue(filters, 500);

  const [lastFilters, setLastFilters] = useState(debouncedFilters);
  if (
    debouncedFilters.name !== lastFilters.name ||
    debouncedFilters.email !== lastFilters.email
  ) {
    setLastFilters(debouncedFilters);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-trainers", { page, ...debouncedFilters }],
    queryFn: () =>
      adminTrainersService.search({
        page,
        perPage: PER_PAGE,
        name: debouncedFilters.name,
        email: debouncedFilters.email,
      }),
    placeholderData: keepPreviousData,
  });

  const trainers = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleToggleStatus = async (trainer, nextStatus) => {
    try {
      await adminTrainersService.updateStatus(trainer.id, nextStatus);
      toast.success(
        nextStatus
          ? "Personal ativado com sucesso"
          : "Personal desativado com sucesso",
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Não foi possível atualizar o status do personal.",
      );
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nome",
      className: "text-sm font-medium text-foreground",
      render: (trainer) => (
        <>
          {trainer.name}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {trainer.email}
          </p>
        </>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      className: "hidden sm:table-cell",
      render: (trainer) => trainer.email,
    },
    {
      key: "students_count",
      label: "Alunos",
      className: "hidden md:table-cell",
      render: (trainer) => trainer.students_count,
    },
    {
      key: "status",
      label: "Status",
      render: (trainer) => (
        <Badge variant={trainer.is_active ? "default" : "secondary"}>
          {trainer.is_active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Cadastro",
      className: "hidden md:table-cell",
      render: (trainer) => formatDateBR(trainer.created_at),
    },
    {
      key: "actions",
      label: "Ações",
      render: (trainer) => (
        <StatusSwitch
          checked={trainer.is_active}
          confirmTitle={trainer.is_active ? "Desativar personal?" : "Ativar personal?"}
          confirmMessage={`Deseja realmente ${
            trainer.is_active ? "desativar" : "ativar"
          } o personal ${trainer.name}?`}
          onConfirm={(next) => handleToggleStatus(trainer, next)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={trainers}
      loading={isLoading}
      fetching={isFetching}
      error={isError}
      onRetry={refetch}
      actionsCount={1}
      emptyIcon={UserRoundX}
      emptyTitle="Nenhum personal encontrado"
      pagination={{
        summary: `${total} personal(is) encontrado(s)`,
        page,
        lastPage,
        onPrev: () => setPage((current) => Math.max(1, current - 1)),
        onNext: () => setPage((current) => Math.min(lastPage, current + 1)),
      }}
      toolbar={
        <>
          <CardHeader>
            <CardTitle>Gerenciamento de Personais</CardTitle>
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
            </div>
          </CardContent>
        </>
      }
    />
  );
}
