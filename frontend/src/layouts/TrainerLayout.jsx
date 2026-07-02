import { BarChart3, Dumbbell, LayoutDashboard, Users } from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const menuItems = [
  { label: "Dashboard", path: "/trainer", icon: LayoutDashboard },
  { label: "Alunos", path: "/trainer/students", icon: Users },
  { label: "Treinos", path: "/trainer/workouts", icon: Dumbbell },
  { label: "Exercícios", path: "/trainer/exercises", icon: BarChart3 },
];

export default function PersonalLayout() {
  return <RoleLayout menuItems={menuItems} title="G6 Academia" />;
}
