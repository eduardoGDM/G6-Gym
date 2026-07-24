import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  Dumbbell,
  LayoutDashboard,
  Users,
} from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

// Agrupado por seção para refletir a hierarquia visual do design system.
// Só entram destinos que já existem como rota — nada de links para telas
// inexistentes (Relatórios, Importar IA etc. ficam de fora até virarem rota).
const navGroups = [
  {
    heading: "Principal",
    items: [
      { label: "Dashboard", path: "/trainer", icon: LayoutDashboard, end: true },
      { label: "Alunos", path: "/trainer/students", icon: Users },
      { label: "Treinos", path: "/trainer/workouts", icon: Dumbbell },
      { label: "Exercícios", path: "/trainer/exercises", icon: BarChart3 },
    ],
  },
  {
    heading: "Acompanhamento",
    items: [
      {
        label: "Check-ins",
        path: "/trainer/checkins/workouts",
        icon: CalendarCheck,
      },
      {
        label: "Check-ins diários",
        path: "/trainer/checkins/daily",
        icon: BedDouble,
      },
    ],
  },
  // Planos ocultos do front do personal — quem atribui plano hoje é o admin.
  // { label: "Planos", path: "/trainer/plans", icon: CreditCard },
];

export default function PersonalLayout() {
  return (
    <RoleLayout navGroups={navGroups} title="G6Fit" roleLabel="Personal" />
  );
}
