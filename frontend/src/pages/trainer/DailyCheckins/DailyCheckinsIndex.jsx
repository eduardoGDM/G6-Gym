import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BedDouble, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import ErrorState from "../../../components/loading/ErrorState";
import TableSkeleton from "../../../components/loading/TableSkeleton";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import trainerDailyCheckinsService from "../../../services/TrainerDailyCheckinsService";

const PER_PAGE = 10;
const SUMMARY_LENGTH = 60;

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return `${formatDate(value)} às ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function summarizeObservations(checkin) {
  const parts = [];
  if (checkin.sleep_notes) parts.push(`Sono: ${checkin.sleep_notes}`);
  if (checkin.diet_notes) parts.push(`Dieta: ${checkin.diet_notes}`);
  const text = parts.join(" · ");

  if (!text) return "—";
  return text.length > SUMMARY_LENGTH
    ? `${text.slice(0, SUMMARY_LENGTH)}…`
    : text;
}

export default function DailyCheckinsIndex() {
  const navigate = useNavigate();

  const [student, setStudent] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedStudent = useDebouncedValue(student, 500);

  const [lastFilters, setLastFilters] = useState({
    student: debouncedStudent,
    dateFrom,
    dateTo,
  });
  if (
    lastFilters.student !== debouncedStudent ||
    lastFilters.dateFrom !== dateFrom ||
    lastFilters.dateTo !== dateTo
  ) {
    setLastFilters({ student: debouncedStudent, dateFrom, dateTo });
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "trainer-daily-checkins",
      { page, student: debouncedStudent, dateFrom, dateTo, perPage: PER_PAGE },
    ],
    queryFn: () =>
      trainerDailyCheckinsService.search({
        page,
        perPage: PER_PAGE,
        student: debouncedStudent,
        dateFrom,
        dateTo,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar os check-ins de dieta e sono.");
    }
  }, [isError]);

  const checkins = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);
  const hasFilters = Boolean(student || dateFrom || dateTo);

  return (
    <PageContainer>
      <PageTitle
        eyebrow="Acompanhamento"
        title="Check-ins de Dieta e Sono"
        description="Acompanhe os registros diários de sono e dieta dos seus alunos."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={student}
            onChange={(event) => setStudent(event.target.value)}
            placeholder="Buscar aluno..."
            className="pl-10"
          />
        </div>

        <Input
          type="date"
          className="sm:w-48"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />

        <Input
          type="date"
          className="sm:w-48"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {isLoading ? (
          <CardContent className="overflow-x-auto p-0">
            <TableSkeleton
              columns={[
                "Aluno",
                { label: "Data avaliada", className: "hidden sm:table-cell" },
                "Nota do sono",
                "Nota da dieta",
                { label: "Resumo das observações", className: "hidden md:table-cell" },
                { label: "Data de criação", className: "hidden lg:table-cell" },
              ]}
              actionsCount={1}
              rows={6}
            />
          </CardContent>
        ) : isError ? (
          <CardContent>
            <ErrorState onRetry={refetch} />
          </CardContent>
        ) : checkins.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BedDouble className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {hasFilters
                  ? "Nenhum check-in encontrado"
                  : "Nenhum check-in registrado ainda"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Tente ajustar os filtros de aluno ou período."
                  : "Assim que seus alunos registrarem o check-in diário, ele aparecerá aqui."}
              </p>
            </div>
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
                      Aluno
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground sm:table-cell">
                      Data avaliada
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Nota do sono
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Nota da dieta
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground md:table-cell">
                      Resumo das observações
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground lg:table-cell">
                      Data de criação
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card/70">
                  {checkins.map((checkin) => (
                    <tr
                      key={checkin.id}
                      className="transition-colors hover:bg-muted/10"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {checkin.student_profile?.user?.name || "—"}
                        <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
                          {formatDate(checkin.date)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {formatDate(checkin.date)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{checkin.sleep_rating}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{checkin.diet_rating}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {summarizeObservations(checkin)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                        {formatDateTime(checkin.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <ActionIconButton
                          icon={Eye}
                          tooltip="Visualizar"
                          onClick={() =>
                            navigate(`/trainer/checkins/daily/${checkin.id}`)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>

            <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {from}–{to} de {total}
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
