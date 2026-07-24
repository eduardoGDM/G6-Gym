import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "../../lib/utils";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";
import Logo from "./Logo";
import MenuItem from "./MenuItem";

export default function Sidebar({
  navGroups,
  drawerWidth,
  mobileOpen,
  onClose,
  isDesktop,
  roleLabel = "Personal",
}) {
  // Aceita tanto o formato agrupado [{ heading, items }] quanto uma lista
  // plana antiga; normaliza para grupos para renderizar de forma única.
  const groups = Array.isArray(navGroups)
    ? navGroups.every((g) => Array.isArray(g?.items))
      ? navGroups
      : [{ heading: null, items: navGroups }]
    : [];
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
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-out",
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
            "flex shrink-0 items-center border-b border-border px-6 py-4",
            isDesktop ? "min-h-[76px]" : "min-h-[68px]",
          )}
        >
          <Logo roleLabel={roleLabel} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-6">
            {groups.map((group, index) => (
              <div key={group.heading ?? index} className="space-y-1">
                {group.heading ? (
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                    {group.heading}
                  </p>
                ) : null}
                {group.items.map((item) => (
                  <MenuItem
                    key={item.label}
                    item={item}
                    onClick={!isDesktop ? onClose : undefined}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="shrink-0 border-t border-border px-3 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {loadingLogout ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </aside>
    </>
  );
}
