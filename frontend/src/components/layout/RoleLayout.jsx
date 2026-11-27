import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import useThemeStore from "../../store/themeStore";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";

const DRAWER_WIDTH = 280;

/**
 * @param {object} props
 * @param {React.ReactNode} [props.overlay] - camada sobreposta (modais) que o papel exibe
 *   em qualquer tela, montada fora do <main> para não interferir no layout.
 * @param {string} [props.theme] - nome do tema aplicado como `data-theme` na raiz.
 *   As variáveis de cor do tema são sobrescritas neste nó (ver `src/index.css`),
 *   então todo utilitário de token abaixo dele muda de valor sem reescrita.
 *   Omitido = tema vermelho padrão. Quando informado, o modo claro/escuro do
 *   `themeStore` também é escrito aqui, como `data-mode`.
 * @param {React.ReactNode} [props.topbarActions] - controles extras na topbar
 *   (ex.: troca de modo claro/escuro), à esquerda das notificações.
 */
export default function RoleLayout({
  navGroups,
  title,
  roleLabel,
  overlay,
  profilePath,
  theme,
  topbarActions,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 900 : true,
  );
  const location = useLocation();
  // O modo só significa algo para quem tem tema próprio; sem `theme` o
  // atributo nem é escrito.
  const mode = useThemeStore((state) => state.mode);

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
    <div
      data-theme={theme}
      data-mode={theme ? mode : undefined}
      className="min-h-screen bg-background text-foreground"
    >
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
          actions={topbarActions}
        />

        <main className="px-4 pt-0 pb-6 sm:px-6 lg:px-8 lg:pt-0 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {overlay}
    </div>
  );
}
