import {
  CalendarCheck,
  Dumbbell,
  History,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";
import DailyCheckinReminder from "../components/student/DailyCheckinReminder";

const navGroups = [
  {
    heading: "Principal",
    items: [
      { label: "Dashboard", path: "/student", icon: LayoutDashboard, end: true },
      { label: "Meus Treinos", path: "/student/my-workouts", icon: Dumbbell },
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
  return (
    <RoleLayout
      navGroups={navGroups}
      title="G6Fit"
      roleLabel="Aluno"
      banner={<DailyCheckinReminder />}
      profilePath="/student/profile"
    />
  );
}
