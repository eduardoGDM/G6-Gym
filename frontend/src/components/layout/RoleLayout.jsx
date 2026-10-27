import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";

const DRAWER_WIDTH = 280;

/**
 * @param {object} props
 * @param {React.ReactNode} [props.banner] - aviso no topo do conteúdo (ocupa espaço no fluxo).
 * @param {React.ReactNode} [props.overlay] - camada sobreposta (modais) que o papel exibe
 *   em qualquer tela, montada fora do <main> para não interferir no layout.
 */
export default function RoleLayout({
  navGroups,
  title,
  roleLabel,
  banner,
  overlay,
  profilePath,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 900 : true,
  );
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        navGroups={navGroups}
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isDesktop={isDesktop}
        roleLabel={roleLabel}
      />

      <div className={isDesktop ? "pl-[280px]" : "pl-0"}>
        <Topbar
          title={title || "G6Fit"}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
          isDesktop={isDesktop}
          roleLabel={roleLabel}
          profilePath={profilePath}
        />

        <main className="px-4 pt-0 pb-6 sm:px-6 lg:px-8 lg:pt-0 lg:pb-8">
          {banner}
          <Outlet />
        </main>
      </div>

      {overlay}
    </div>
  );
}
