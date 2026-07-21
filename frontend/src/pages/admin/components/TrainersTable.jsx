import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserRoundX } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import ErrorState from "../../../components/loading/ErrorState";
import TableSkeleton from "../../../components/loading/TableSkeleton";
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

  return (
    <Card className="border-border/80 bg-card/80">
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

      {isLoading ? (
        <CardContent className="overflow-x-auto p-0">
          <TableSkeleton
            columns={[
              "Nome",
              { label: "E-mail", className: "hidden sm:table-cell" },
              { label: "Alunos", className: "hidden md:table-cell" },
              "Status",
              { label: "Cadastro", className: "hidden md:table-cell" },
            ]}
            actionsCount={1}
            rows={5}
          />
        </CardContent>
      ) : isError ? (
        <CardContent>
          <ErrorState onRetry={refetch} />
        </CardContent>
      ) : trainers.length === 0 ? (
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <UserRoundX className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">Nenhum personal encontrado</h2>
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
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground sm:table-cell">
                    E-mail
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground md:table-cell">
                    Alunos
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground md:table-cell">
                    Cadastro
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card/70">
                {trainers.map((trainer) => (
                  <tr key={trainer.id} className="transition-colors hover:bg-muted/10">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {trainer.name}
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
                        {trainer.email}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {trainer.email}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {trainer.students_count}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={trainer.is_active ? "default" : "secondary"}>
                        {trainer.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {formatDateBR(trainer.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSwitch
                        checked={trainer.is_active}
                        confirmTitle={
                          trainer.is_active ? "Desativar personal?" : "Ativar personal?"
                        }
                        confirmMessage={`Deseja realmente ${
                          trainer.is_active ? "desativar" : "ativar"
                        } o personal ${trainer.name}?`}
                        onConfirm={(next) => handleToggleStatus(trainer, next)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>

          <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              {total} personal(is) encontrado(s)
            </span>
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
                onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
