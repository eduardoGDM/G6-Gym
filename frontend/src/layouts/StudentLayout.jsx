import {
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  History,
  LayoutDashboard,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";

import ThemeModeToggle from "../components/ficha/ThemeModeToggle";
import RoleLayout from "../components/layout/RoleLayout";
import DailyCheckinReminder from "../components/student/DailyCheckinReminder";
import PendingWorkoutModal from "../components/student/PendingWorkoutModal";
import authService from "../services/authService";
import useAuthStore from "../store/authStore";

const manageWorkoutsItem = {
  label: "Gerenciar Treinos",
  path: "/student/manage-workouts",
  icon: ClipboardList,
};

const buildNavGroups = (canManageWorkouts) => [
  {
    heading: "Principal",
    items: [
      { label: "Dashboard", path: "/student", icon: LayoutDashboard, end: true },
      { label: "Meus Treinos", path: "/student/my-workouts", icon: Dumbbell },
      ...(canManageWorkouts ? [manageWorkoutsItem] : []),
    ],
  },
  {
    heading: "Acompanhamento",
    items: [
      {
        label: "Check-in Diário",
        path: "/student/daily-checkins",
        icon: CalendarCheck,
      },
      { label: "Evolução", path: "/student/evolution", icon: TrendingUp },
      { label: "Histórico", path: "/student/history", icon: History },
    ],
  },
  {
    heading: "Conta",
    items: [
      { label: "Meu Perfil", path: "/student/profile", icon: UserRound },
    ],
  },
];

export default function StudentLayout() {
  const canManageWorkouts = useAuthStore(
    (state) => state.user?.student_profile?.can_manage_workouts === true,
  );

  // A permissão pode ser concedida/revogada pelo personal com o aluno logado.
  // Ao voltar para a aba, sincroniza a flag para atualizar menu e rotas.
  useEffect(() => {
    const syncPermissions = async () => {
      try {
        const freshUser = await authService.me();
        const { user, setUser } = useAuthStore.getState();

        if (
          user &&
          freshUser?.student_profile?.can_manage_workouts !==
            user.student_profile?.can_manage_workouts
        ) {
          setUser({ ...user, student_profile: freshUser.student_profile });
        }
      } catch {
        // sessão inválida é tratada pelo interceptor global
      }
    };

    window.addEventListener("focus", syncPermissions);
    return () => window.removeEventListener("focus", syncPermissions);
  }, []);

  return (
    <RoleLayout
      // Tema "A Ficha": giz, ferro e anilha. Escopado aqui — o treinador segue
      // no tema vermelho. Valores em `src/index.css`.
      theme="ficha"
      // Escuro é o padrão; o botão troca para o claro e a escolha persiste.
      topbarActions={<ThemeModeToggle />}
      navGroups={buildNavGroups(canManageWorkouts)}
      title="G6Fit"
      roleLabel="Aluno"
      banner={<DailyCheckinReminder />}
      overlay={<PendingWorkoutModal />}
      profilePath="/student/profile"
    />
  );
}
