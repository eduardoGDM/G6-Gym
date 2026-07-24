import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, GraduationCap, UserRoundCheck, Users } from "lucide-react";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/dashboard/StatCard";
import adminDashboardService from "../../services/AdminDashboardService";
import useAuthStore from "../../store/authStore";
import { getGreeting } from "../../utils/greeting";
import StudentsTable from "./components/StudentsTable";
import TrainersTable from "./components/TrainersTable";

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: adminDashboardService.summary,
  });

  const stats = [
    {
      label: "Personais Ativos",
      value: summary?.active_trainers ?? 0,
      icon: UserRoundCheck,
    },
    {
      label: "Alunos Ativos",
      value: summary?.active_students ?? 0,
      icon: GraduationCap,
    },
    {
      label: "Total de Usuários",
      value: summary?.total_users ?? 0,
      icon: Users,
    },
    {
      label: "Cadastros Hoje",
      value: summary?.registrations_today ?? 0,
      icon: CalendarPlus,
    },
  ];

  return (
    <PageContainer>
      <PageTitle
        eyebrow={`${getGreeting()}, ${user?.name?.split(" ")[0] || ""} 👋`}
        title="Bem-vindo ao painel administrativo do G6Fit"
        description="Acompanhe e gerencie personais e alunos de toda a plataforma."
      />

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

      <div className="mt-6">
        <TrainersTable />
      </div>

      <div className="mt-6">
        <StudentsTable />
      </div>
    </PageContainer>
  );
}
