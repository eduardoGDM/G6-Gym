import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";
import Logo from "./Logo";
import MenuItem from "./MenuItem";

export default function Sidebar({
  menuItems,
  drawerWidth,
  mobileOpen,
  onClose,
  isDesktop,
  roleLabel = "Personal",
}) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    if (mobileOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isDesktop]);

  const handleLogout = async () => {
    setLoadingLogout(true);

    try {
      await authService.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Backend logout falhou:", error);
      }
    } finally {
      logout();
      navigate("/");
      setLoadingLogout(false);
    }
  };

  return (
    <>
      {!isDesktop && mobileOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          aria-label="Fechar menu"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          isDesktop
            ? "translate-x-0"
            : mobileOpen
              ? "translate-x-0"
              : "-translate-x-full",
        ].join(" ")}
        style={{ width: isDesktop ? drawerWidth : "min(88vw, 320px)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <Logo />

          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {roleLabel}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 rounded-2xl border border-border bg-background/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Academia G6</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Gestão organizada para alunos, treinos e exercícios.
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
                onClick={!isDesktop ? onClose : undefined}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loadingLogout ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </aside>
    </>
  );
}
