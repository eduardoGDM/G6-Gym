import { CalendarCheck, Dumbbell, History, LayoutDashboard } from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const menuItems = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard },
  { label: "Meus Treinos", path: "/student/my-workouts", icon: Dumbbell },
  { label: "Histórico", path: "/student/history", icon: History },
  {
    label: "Check-in Diário",
    path: "/student/daily-checkins",
    icon: CalendarCheck,
  },
];

export default function StudentLayout() {
  return (
    <RoleLayout menuItems={menuItems} title="G6 Academia" roleLabel="Aluno" />
  );
}
