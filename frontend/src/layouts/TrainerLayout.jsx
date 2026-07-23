import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Users,
} from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const menuItems = [
  { label: "Dashboard", path: "/trainer", icon: LayoutDashboard, end: true },
  { label: "Alunos", path: "/trainer/students", icon: Users },
  { label: "Treinos", path: "/trainer/workouts", icon: Dumbbell },
  { label: "Exercícios", path: "/trainer/exercises", icon: BarChart3 },
  {
    label: "Check-ins",
    icon: CalendarCheck,
    children: [
      {
        label: "Check-ins de Treino",
        path: "/trainer/checkins/workouts",
        icon: Dumbbell,
      },
      {
        label: "Check-ins de Dieta e Sono",
        path: "/trainer/checkins/daily",
        icon: BedDouble,
      },
    ],
  },
  { label: "Planos", path: "/trainer/plans", icon: CreditCard },
];

export default function PersonalLayout() {
  return (
    <RoleLayout menuItems={menuItems} title="G6Fit" roleLabel="Personal" />
  );
}
