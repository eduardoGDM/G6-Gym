import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarCheck, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Badge } from "../../../components/ui/badge";
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

  const columns = [
    {
      key: "student",
      label: "Aluno",
      className: "text-sm font-medium text-foreground",
      render: (checkin) => (
        <>
          {checkin.student_profile?.user?.name || "—"}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {formatDate(checkin.performed_at)}
          </p>
        </>
      ),
    },
    {
      key: "workout",
      label: "Treino",
      render: (checkin) => checkin.workout?.name || "Treino removido",
    },
    {
      key: "performed_at",
      label: "Data de execução",
      className: "hidden sm:table-cell",
      render: (checkin) => formatDate(checkin.performed_at),
    },
    {
      key: "exercises_count",
      label: "Exercícios",
      className: "hidden md:table-cell",
      render: (checkin) => <Badge variant="outline">{checkin.exercises_count ?? 0}</Badge>,
    },
    {
      key: "created_at",
      label: "Registrado em",
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
          onClick={() => navigate(`/trainer/checkins/workouts/${checkin.id}`)}
        />
      ),
    },
  ];

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

      <DataTable
        className="mt-4"
        columns={columns}
        rows={checkins}
        loading={isLoading}
        fetching={isFetching}
        error={isError}
        onRetry={refetch}
        actionsCount={1}
        emptyIcon={CalendarCheck}
        emptyTitle={
          hasFilters ? "Nenhum check-in encontrado" : "Nenhum check-in registrado ainda"
        }
        emptyDescription={
          hasFilters
            ? "Tente ajustar os filtros de aluno ou data."
            : "Assim que seus alunos concluírem treinos, os check-ins aparecerão aqui."
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
