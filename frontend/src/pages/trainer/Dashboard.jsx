import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck2,
  ClipboardList,
  Moon,
  UserRoundX,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import RecentActivityTable from "../../components/dashboard/RecentActivityTable";
import StatCard from "../../components/dashboard/StatCard";
import trainerDashboardService from "../../services/TrainerDashboardService";
import useAuthStore from "../../store/authStore";
import { getGreeting } from "../../utils/greeting";

const formatDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["trainer-dashboard-summary"],
    queryFn: trainerDashboardService.summary,
  });

  const { data: recentWorkoutCheckins, isLoading: isLoadingWorkoutCheckins } =
    useQuery({
      queryKey: ["trainer-dashboard-recent-workout-checkins"],
      queryFn: trainerDashboardService.recentWorkoutCheckins,
    });

  const { data: recentDailyCheckins, isLoading: isLoadingDailyCheckins } =
    useQuery({
      queryKey: ["trainer-dashboard-recent-daily-checkins"],
      queryFn: trainerDashboardService.recentDailyCheckins,
    });

  const { data: pendingDailyCheckins, isLoading: isLoadingPending } = useQuery({
    queryKey: ["trainer-dashboard-pending-daily-checkins"],
    queryFn: trainerDashboardService.pendingDailyCheckins,
  });

  const stats = [
    {
      label: "Alunos ativos",
      value: summary?.active_students ?? 0,
      icon: Users,
      tone: "from-secondary/30 to-secondary/10",
    },
    {
      label: "Treinos ativos",
      value: summary?.active_workouts ?? 0,
      icon: ClipboardList,
      tone: "from-secondary/30 to-secondary/10",
    },
    {
      label: "Check-ins de treino hoje",
      value: summary?.workout_checkins_today ?? 0,
      icon: CalendarCheck2,
      tone: "from-secondary/30 to-secondary/10",
    },
    {
      label: "Check-ins diários hoje",
      value: summary?.daily_checkins_today ?? 0,
      icon: Moon,
      tone: "from-secondary/30 to-secondary/10",
    },
  ];

  return (
    <PageContainer>
      <PageTitle
        eyebrow={`${getGreeting()}, ${user?.name?.split(" ")[0] || ""} 👋`}
        title="Bem-vindo novamente ao G6Fit"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            loading={isLoadingSummary}
            delay={index * 60}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <RecentActivityTable
          title="Últimos check-ins de treino"
          loading={isLoadingWorkoutCheckins}
          rows={recentWorkoutCheckins || []}
          emptyIcon={ClipboardList}
          emptyTitle="Nenhum check-in de treino registrado ainda."
          emptyDescription="Assim que os alunos registrarem treinos, eles aparecerão aqui."
          columns={[
            { key: "student_name", label: "Aluno" },
            {
              key: "workout_name",
              label: "Treino",
              className: "hidden sm:table-cell",
            },
            {
              key: "date",
              label: "Data",
              render: (row) => formatDate(row.date),
            },
            {
              key: "time",
              label: "Horário",
              className: "hidden sm:table-cell",
            },
          ]}
          onAction={(row) => navigate(`/trainer/checkins/workouts/${row.id}`)}
          delay={120}
        />

        <RecentActivityTable
          title="Últimos check-ins diários"
          loading={isLoadingDailyCheckins}
          rows={recentDailyCheckins || []}
          emptyIcon={Moon}
          emptyTitle="Nenhum Check-in Diário registrado ainda."
          emptyDescription="Assim que os alunos registrarem o dia, eles aparecerão aqui."
          columns={[
            { key: "student_name", label: "Aluno" },
            { key: "sleep_rating", label: "Nota Sono" },
            { key: "diet_rating", label: "Nota Dieta" },
            {
              key: "date",
              label: "Data",
              render: (row) => formatDate(row.date),
            },
          ]}
          onAction={(row) => navigate(`/trainer/checkins/daily/${row.id}`)}
          delay={160}
        />
      </div>

      <div className="mt-4">
        <RecentActivityTable
          title="Alunos com Check-in Diário pendente (ontem)"
          loading={isLoadingPending}
          rows={pendingDailyCheckins || []}
          emptyIcon={UserRoundX}
          emptyTitle="Todo mundo em dia!"
          emptyDescription="Nenhum aluno com pendência de Check-in Diário."
          columns={[
            { key: "name", label: "Aluno" },
            {
              key: "phone",
              label: "Telefone",
              className: "hidden sm:table-cell",
            },
            {
              key: "last_daily_checkin",
              label: "Último Check-in Diário",
              render: (row) => formatDate(row.last_daily_checkin),
            },
          ]}
          onAction={(row) => navigate(`/trainer/students/${row.id}`)}
          actionTooltip="Visualizar aluno"
          delay={200}
        />
      </div>
    </PageContainer>
  );
}
