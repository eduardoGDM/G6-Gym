import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  FileText,
  Moon,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import DonutStat from "../../components/dashboard/DonutStat";
import ProgressRing from "../../components/dashboard/ProgressRing";
import StatCard from "../../components/dashboard/StatCard";
import {
  DietSleepChart,
  WeeklyWorkoutChart,
} from "../../components/dashboard/WeeklyCharts";
import EmptyState from "../../components/loading/EmptyState";
import { Button } from "../../components/ui/button";
import { Card, CardTitle } from "../../components/ui/card";
import trainerDashboardService from "../../services/TrainerDashboardService";
import useAuthStore from "../../store/authStore";
import { getGreeting } from "../../utils/greeting";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const pad = (n) => String(n).padStart(2, "0");
const localISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Rótulo relativo (Hoje / Ontem / dd/mm) — separado do horário.
const relativeDay = (value) => {
  if (!value) return "";
  const day = value.slice(0, 10);
  const today = localISO(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (day === today) return "Hoje";
  if (day === localISO(y)) return "Ontem";
  return `${day.slice(8, 10)}/${day.slice(5, 7)}`;
};

const todayLabel = () => {
  const now = new Date();
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`;
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Avatar do aluno: foto quando disponível, com fallback para as iniciais
// (também quando a URL falha ao carregar).
function StudentAvatar({ name, url }) {
  const [broken, setBroken] = useState(false);

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setBroken(true)}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {initials(name)}
    </span>
  );
}

// Monta o texto de variação (trend) a partir do delta da API; oculta quando
// não há variação.
function toTrend(delta) {
  if (!delta || delta.direction === "flat" || !delta.value) return undefined;
  const sign = delta.direction === "down" ? "−" : "+";
  return { label: `${sign}${delta.value} ${delta.period}`, direction: delta.direction };
}

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

  const { data: studentsList, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["trainer-dashboard-active-students"],
    queryFn: trainerDashboardService.activeStudents,
  });

  const { data: weeklyEvolution, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["trainer-dashboard-weekly-evolution"],
    queryFn: trainerDashboardService.weeklyEvolution,
  });

  const stats = [
    {
      label: "Check-ins de treino hoje",
      value: summary?.workout_checkins_today ?? 0,
      icon: ClipboardList,
      trend: toTrend(summary?.workout_checkins_today_delta),
    },
    {
      label: "Treinos ativos",
      value: summary?.active_workouts ?? 0,
      icon: Dumbbell,
      trend: toTrend(summary?.active_workouts_delta),
    },
    {
      label: "Alunos ativos",
      value: summary?.active_students ?? 0,
      icon: Users,
      trend: toTrend(summary?.active_students_delta),
    },
  ];

  const weeklyAdherence = summary?.weekly_adherence;
  const students = studentsList || [];

  // Atividade recente: mescla check-ins de treino (vermelho) e diários (cinza),
  // ordenada do mais recente para o mais antigo, com sistema de ícones por tipo.
  const workoutActivity = (recentWorkoutCheckins || []).map((row) => ({
    id: `workout-${row.id}`,
    name: row.student_name,
    action: row.workout_name
      ? `Concluiu o treino ${row.workout_name}`
      : "Registrou check-in de treino",
    whenLabel: relativeDay(row.date),
    whenTime: row.time ? row.time.slice(0, 5) : null,
    sortKey: `${row.date ?? ""} ${row.time ?? ""}`,
    icon: Dumbbell,
    tone: "red",
    onClick: () => navigate(`/trainer/checkins/workouts/${row.id}`),
  }));

  const dailyActivity = (recentDailyCheckins || []).map((row) => ({
    id: `daily-${row.id}`,
    name: row.student_name,
    action: "Registrou check-in diário",
    whenLabel: relativeDay(row.date),
    whenTime: null,
    sortKey: `${row.date ?? ""}`,
    icon: Moon,
    tone: "gray",
    onClick: () => navigate(`/trainer/checkins/daily/${row.id}`),
  }));

  const activityItems = [...workoutActivity, ...dailyActivity]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .slice(0, 8);

  const quickActions = [
    {
      label: "Novo treino",
      icon: Plus,
      variant: "default",
      onClick: () => navigate("/trainer/workouts/new"),
    },
    {
      label: "Novo aluno",
      icon: UserPlus,
      variant: "outline",
      onClick: () => navigate("/trainer/students/new"),
    },
    {
      label: "Gerar ficha (PDF)",
      icon: FileText,
      variant: "outline",
      // A geração da ficha vive na listagem de alunos (por aluno).
      onClick: () => navigate("/trainer/students"),
    },
  ];

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="[&>div]:mb-0">
          <PageTitle
            eyebrow={`${getGreeting()}, ${user?.name?.split(" ")[0] || ""} 👋`}
            title="Vamos construir resultados."
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="capitalize">{todayLabel()}</span>
        </div>
      </div>

      {/* Linha superior: 3 indicadores + donut de adesão. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            loading={isLoadingSummary}
            delay={index * 60}
          />
        ))}

        <DonutStat
          value={weeklyAdherence?.percentage ?? 0}
          label="Check-ins da semana"
          sublabel={
            weeklyAdherence
              ? `${weeklyAdherence.students_checked_in} de ${weeklyAdherence.active_students} alunos`
              : ""
          }
          loading={isLoadingSummary}
          delay={180}
        />
      </div>

      {/* Corpo: atividade recente | alunos | ações + dica. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ActivityTimeline
          title="Atividade recente"
          items={activityItems}
          loading={isLoadingWorkoutCheckins || isLoadingDailyCheckins}
          emptyIcon={ClipboardList}
          emptyTitle="Nenhuma atividade recente"
          emptyDescription="Assim que seus alunos registrarem check-ins, eles aparecem aqui."
          delay={120}
        />

        {/* Seus alunos — nome, resumo e anel de progresso (dados reais). */}
        <Card
          className="animate-in fade-in slide-in-from-bottom-2 flex flex-col overflow-hidden duration-300"
          style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
        >
          <div className="flex items-center justify-between gap-3 p-5 pb-2">
            <CardTitle className="text-base">Seus alunos</CardTitle>
            <button
              type="button"
              onClick={() => navigate("/trainer/students")}
              className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Ver todos
            </button>
          </div>

          <div className="flex-1 px-2 pb-2">
            {isLoadingStudents ? (
              <div className="space-y-1 p-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-3/5 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum aluno ativo"
                description="Cadastre alunos para acompanhá-los por aqui."
              />
            ) : (
              <ul className="space-y-0.5">
                {students.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/trainer/students/${student.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <StudentAvatar
                        name={student.name}
                        url={student.avatar_url}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {student.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {student.active_workouts_count}{" "}
                          {student.active_workouts_count === 1
                            ? "treino ativo"
                            : "treinos ativos"}{" "}
                          · {student.last_checkin_label}
                        </span>
                      </span>
                      <ProgressRing value={student.progress_percentage} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Ações rápidas. */}
        <Card
          className="animate-in fade-in slide-in-from-bottom-2 p-5 duration-300"
          style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
        >
          <CardTitle className="text-base">Ações rápidas</CardTitle>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="w-full justify-start"
                onClick={action.onClick}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Evolução semanal: check-ins de treino e médias de dieta/sono. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <WeeklyWorkoutChart
          data={weeklyEvolution?.workout_checkins || []}
          loading={isLoadingWeekly}
          delay={120}
        />
        <DietSleepChart
          data={weeklyEvolution?.daily_checkins || []}
          loading={isLoadingWeekly}
          delay={160}
        />
      </div>
    </PageContainer>
  );
}
