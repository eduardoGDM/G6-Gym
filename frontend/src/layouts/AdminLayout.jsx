import { LayoutDashboard } from "lucide-react";
import RoleLayout from "../components/layout/RoleLayout";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
];

export default function AdminLayout() {
  return (
    <RoleLayout menuItems={menuItems} title="G6Fit" roleLabel="Admin" />
  );
}
