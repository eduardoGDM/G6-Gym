import { LayoutDashboard } from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const navGroups = [
  {
    heading: "Principal",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    ],
  },
];

export default function AdminLayout() {
  return (
    <RoleLayout navGroups={navGroups} title="G6Fit" roleLabel="Admin" />
  );
}
