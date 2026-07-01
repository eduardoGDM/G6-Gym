import { BarChart3, Dumbbell, LayoutDashboard, Users } from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const menuItems = [
  { label: "Dashboard", path: "/personal", icon: LayoutDashboard },
  { label: "Alunos", path: "/personal/alunos", icon: Users },
  { label: "Treinos", path: "/personal/treinos", icon: Dumbbell },
  { label: "Exercícios", path: "/personal/exercicios", icon: BarChart3 },
];

export default function PersonalLayout() {
  return <RoleLayout menuItems={menuItems} title="G6 Academia" />;
}
