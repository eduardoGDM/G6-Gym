import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BedDouble, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Badge } from "../../../components/ui/badge";
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

  const columns = [
    {
      key: "student",
      label: "Aluno",
      className: "text-sm font-medium text-foreground",
      render: (checkin) => (
        <>
          {checkin.student_profile?.user?.name || "—"}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {formatDate(checkin.date)}
          </p>
        </>
      ),
    },
    {
      key: "date",
      label: "Data avaliada",
      className: "hidden sm:table-cell",
      render: (checkin) => formatDate(checkin.date),
    },
    {
      key: "sleep_rating",
      label: "Nota do sono",
      render: (checkin) => <Badge variant="outline">{checkin.sleep_rating}</Badge>,
    },
    {
      key: "diet_rating",
      label: "Nota da dieta",
      render: (checkin) => <Badge variant="outline">{checkin.diet_rating}</Badge>,
    },
    {
      key: "summary",
      label: "Resumo das observações",
      className: "hidden md:table-cell",
      render: (checkin) => summarizeObservations(checkin),
    },
    {
      key: "created_at",
      label: "Data de criação",
      className: "hidden lg:table-cell",
      render: (checkin) => formatDateTime(checkin.created_at),
    },
    {
      key: "actions",
      label: "Ações",
      render: (checkin) => (
        <ActionIconButton
          icon={Eye}
          tooltip="Visualizar"
          onClick={() => navigate(`/trainer/checkins/daily/${checkin.id}`)}
        />
      ),
    },
  ];

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

      <DataTable
        className="mt-4"
        columns={columns}
        rows={checkins}
        loading={isLoading}
        fetching={isFetching}
        error={isError}
        onRetry={refetch}
        actionsCount={1}
        emptyIcon={BedDouble}
        emptyTitle={
          hasFilters ? "Nenhum check-in encontrado" : "Nenhum check-in registrado ainda"
        }
        emptyDescription={
          hasFilters
            ? "Tente ajustar os filtros de aluno ou período."
            : "Assim que seus alunos registrarem o check-in diário, ele aparecerá aqui."
        }
        pagination={{
          summary: `${from}–${to} de ${total}`,
          page,
          lastPage,
          onPrev: () => setPage((current) => Math.max(1, current - 1)),
          onNext: () => setPage((current) => Math.min(lastPage, current + 1)),
        }}
      />
    </PageContainer>
  );
}
