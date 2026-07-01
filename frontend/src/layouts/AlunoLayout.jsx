import { Outlet } from "react-router-dom";

export default function AlunoLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
