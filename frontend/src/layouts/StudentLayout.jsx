import {
  ClipboardList,
  Dumbbell,
  History,
  LayoutDashboard,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import ThemeModeToggle from "../components/ficha/ThemeModeToggle";
import MobileTabBar from "../components/layout/MobileTabBar";
import RoleLayout from "../components/layout/RoleLayout";
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

/**
 * Destinos da barra inferior no mobile. Cinco é o limite: em 360px cada aba
 * fica com 72px, e um sexto rótulo quebraria.
 *
 * "Gerenciar treinos" e "Sair da conta" não entram aqui — no mobile os dois
 * vivem na tela de perfil, que é a última aba.
 */
const TAB_ITEMS = [
  { label: "Hoje", path: "/student", icon: LayoutDashboard, end: true },
  { label: "Treinos", path: "/student/my-workouts", icon: Dumbbell },
  { label: "Histórico", path: "/student/history", icon: History },
  { label: "Evolução", path: "/student/evolution", icon: TrendingUp },
  { label: "Perfil", path: "/student/profile", icon: UserRound },
];

export default function StudentLayout() {
  const { pathname } = useLocation();

  const canManageWorkouts = useAuthStore(
    (state) => state.user?.student_profile?.can_manage_workouts === true,
  );

  // Nas telas de tarefa do treino (executar e trocar exercícios) a barra
  // inferior sai: as duas já têm a própria barra fixa de ação, e duas barras
  // empilhadas comeriam a altura útil justamente onde o aluno digita carga e
  // repetição. O caminho de volta nelas é o link do cabeçalho.
  //
  // Cobre /student/workout/:id e /student/workout/:id/edit.
  const hideTabBar = pathname.startsWith("/student/workout");

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
      overlay={<PendingWorkoutModal />}
      // Navegação na zona do polegar: o app é usado de pé, na academia.
      mobileNav={<MobileTabBar items={TAB_ITEMS} />}
      mobileNavHidden={hideTabBar}
      profilePath="/student/profile"
    />
  );
}
