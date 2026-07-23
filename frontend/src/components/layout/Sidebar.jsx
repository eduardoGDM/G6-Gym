import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "../../lib/utils";
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
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-border px-6",
            isDesktop ? "min-h-[72px]" : "min-h-[64px]",
          )}
        >
          <Logo roleLabel={roleLabel} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
                onClick={!isDesktop ? onClose : undefined}
              />
            ))}
          </nav>
        </div>

        <div className="shrink-0 border-t border-border px-3 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {loadingLogout ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </aside>
    </>
  );
}
