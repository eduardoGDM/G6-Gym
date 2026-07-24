import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Dumbbell,
  Moon,
  Salad,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import RecentActivityTable from "../../components/dashboard/RecentActivityTable";
import StatCard from "../../components/dashboard/StatCard";
import StreakCard from "../../components/student/StreakCard";
import WeekConsistency from "../../components/student/WeekConsistency";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import gamificationService from "../../services/GamificationService";
import studentDashboardService from "../../services/StudentDashboardService";
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
    queryKey: ["student-dashboard-summary"],
    queryFn: studentDashboardService.summary,
  });

  const { data: recentWorkouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["student-dashboard-recent-workouts"],
    queryFn: studentDashboardService.recentWorkouts,
  });

  const { data: evolution, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ["student-dashboard-evolution"],
    queryFn: studentDashboardService.evolution,
  });

  const { data: gamification, isLoading: isLoadingGamification } = useQuery({
    queryKey: ["student-gamification-summary"],
    queryFn: gamificationService.summary,
  });

  const stats = [
    {
      label: "Treinos ativos",
      value: summary?.active_workouts ?? 0,
      icon: Dumbbell,
    },
    {
      label: "Último treino",
      value: formatDate(summary?.last_workout_checkin),
      icon: CalendarDays,
    },
    {
      label: "Nota média de Sono (30d)",
      value: summary?.avg_sleep_rating ?? "—",
      icon: Moon,
    },
    {
      label: "Nota média da Dieta (30d)",
      value: summary?.avg_diet_rating ?? "—",
      icon: Salad,
    },
  ];

  const evolutionItems = [
    { label: "Exercício mais executado", value: evolution?.top_exercise || "—" },
    {
      label: "Maior carga registrada",
      value: evolution?.max_weight != null ? `${evolution.max_weight} kg` : "—",
    },
    { label: "Total de Check-ins", value: evolution?.total_checkins ?? 0 },
    {
      label: "Total de exercícios realizados",
      value: evolution?.total_exercises_performed ?? 0,
    },
  ];

  return (
    <PageContainer>
      <PageTitle
        eyebrow={`${getGreeting()}, ${user?.name?.split(" ")[0] || ""} 👋`}
        title="Vamos continuar evoluindo hoje"
        description="Acompanhe seus treinos e sua evolução em um único lugar."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(220px,1fr)_2fr]">
        <StreakCard
          current={gamification?.streak?.current ?? 0}
          longest={gamification?.streak?.longest ?? 0}
          loading={isLoadingGamification}
        />
        <WeekConsistency
          days={gamification?.week || []}
          sleep={gamification?.sleep}
          loading={isLoadingGamification}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            loading={isLoadingSummary}
            delay={index * 60}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <RecentActivityTable
          title="Últimos treinos"
          loading={isLoadingWorkouts}
          rows={recentWorkouts || []}
          emptyIcon={Dumbbell}
          emptyTitle="Você ainda não possui Check-ins registrados."
          emptyDescription="Assim que você concluir um treino, ele aparecerá aqui."
          columns={[
            { key: "workout_name", label: "Treino" },
            {
              key: "date",
              label: "Data",
              render: (row) => formatDate(row.date),
            },
            {
              key: "exercises_count",
              label: "Qtd. exercícios",
              className: "hidden sm:table-cell",
            },
          ]}
          onAction={(row) => navigate(`/student/history/${row.id}`)}
          delay={120}
        />

        <Card
          className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Resumo de evolução
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            {evolutionItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {isLoadingEvolution ? (
                  <div className="mt-2 h-6 w-20 animate-pulse rounded-md bg-muted/40" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
