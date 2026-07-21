import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarCheck, Eye } from "lucide-react";
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
import { Select } from "../../../components/ui/select";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import trainerCheckinsService from "../../../services/TrainerCheckinsService";

const PER_PAGE = 10;

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

export default function CheckinsIndex() {
  const navigate = useNavigate();

  const [studentProfileId, setStudentProfileId] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const debouncedDate = useDebouncedValue(date, 500);

  const [lastFilters, setLastFilters] = useState({
    studentProfileId,
    date: debouncedDate,
  });
  if (
    lastFilters.studentProfileId !== studentProfileId ||
    lastFilters.date !== debouncedDate
  ) {
    setLastFilters({ studentProfileId, date: debouncedDate });
    setPage(1);
  }

  const { data: students } = useQuery({
    queryKey: ["trainer-checkins-students"],
    queryFn: () => trainerCheckinsService.getStudents(),
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "trainer-checkins",
      { page, studentProfileId, date: debouncedDate, perPage: PER_PAGE },
    ],
    queryFn: () =>
      trainerCheckinsService.search({
        page,
        perPage: PER_PAGE,
        studentProfileId,
        date: debouncedDate,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar os check-ins.");
    }
  }, [isError]);

  const checkins = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);
  const hasFilters = Boolean(studentProfileId || debouncedDate);

  const handleStudentChange = (event) => {
    setStudentProfileId(event.target.value);
  };

  return (
    <PageContainer>
      <PageTitle
        eyebrow="Acompanhamento"
        title="Check-ins"
        description="Acompanhe os treinos executados pelos seus alunos."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          className="sm:w-64"
          value={studentProfileId}
          onChange={handleStudentChange}
        >
          <option value="">Todos os alunos</option>
          {(students || []).map((student) => (
            <option key={student.id} value={student.id}>
              {student.user?.name}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          className="sm:w-48"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {isLoading ? (
          <CardContent className="overflow-x-auto p-0">
            <TableSkeleton
              columns={[
                "Aluno",
                "Treino",
                { label: "Data de execução", className: "hidden sm:table-cell" },
                { label: "Exercícios", className: "hidden md:table-cell" },
                { label: "Registrado em", className: "hidden lg:table-cell" },
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
              <CalendarCheck className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {hasFilters
                  ? "Nenhum check-in encontrado"
                  : "Nenhum check-in registrado ainda"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Tente ajustar os filtros de aluno ou data."
                  : "Assim que seus alunos concluírem treinos, os check-ins aparecerão aqui."}
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Treino
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground sm:table-cell">
                      Data de execução
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground md:table-cell">
                      Exercícios
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground lg:table-cell">
                      Registrado em
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
                          {formatDate(checkin.performed_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {checkin.workout?.name || "Treino removido"}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {formatDate(checkin.performed_at)}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <Badge variant="outline">
                          {checkin.exercises_count ?? 0}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                        {formatDateTime(checkin.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <ActionIconButton
                          icon={Eye}
                          tooltip="Visualizar"
                          onClick={() =>
                            navigate(`/trainer/checkins/workouts/${checkin.id}`)
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
