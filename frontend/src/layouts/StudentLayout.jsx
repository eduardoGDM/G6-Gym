import {
  CalendarCheck,
  Dumbbell,
  History,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";
import DailyCheckinReminder from "../components/student/DailyCheckinReminder";

const menuItems = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard, end: true },
  { label: "Meus Treinos", path: "/student/my-workouts", icon: Dumbbell },
  { label: "Histórico", path: "/student/history", icon: History },
  {
    label: "Check-in Diário",
    path: "/student/daily-checkins",
    icon: CalendarCheck,
  },
  { label: "Meu Perfil", path: "/student/profile", icon: UserRound },
];

export default function StudentLayout() {
  return (
    <RoleLayout
      menuItems={menuItems}
      title="G6Fit"
      roleLabel="Aluno"
      banner={<DailyCheckinReminder />}
      profilePath="/student/profile"
    />
  );
}
