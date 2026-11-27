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
 * @param {React.ReactNode} [props.mobileNav] - navegação fixa no rodapé, usada
 *   no lugar da gaveta abaixo de 900px. Quando informada, o hambúrguer e o chip
 *   de usuário saem da topbar (os destinos passam a estar na barra) e o
 *   conteúdo ganha a folga de rolagem equivalente à altura dela.
 * @param {boolean} [props.mobileNavHidden] - esconde a barra numa tela
 *   específica (ex.: a execução de treino, que tem a própria barra fixa) sem
 *   devolver o hambúrguer à topbar: a navegação do papel continua sendo a
 *   barra, só não aparece ali.
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
  mobileNav,
  mobileNavHidden = false,
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

  // A barra inferior é a navegação do mobile; no desktop quem manda é a
  // sidebar. O corte é o mesmo para as duas, em JS, para nunca aparecerem ao
  // mesmo tempo.
  const hasMobileNav = Boolean(mobileNav) && !isDesktop;
  const showMobileNav = hasMobileNav && !mobileNavHidden;

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
          // Com a barra inferior montada, a gaveta não tem mais função e o
          // perfil já é um destino dela.
          showMenuButton={!hasMobileNav}
          showUserChip={!hasMobileNav}
          roleLabel={roleLabel}
          profilePath={profilePath}
          actions={topbarActions}
        />

        {/* O gutter lateral é do `PageContainer`, não daqui: somados, os dois
            comiam 32px de cada lado no mobile. */}
        <main
          className={
            showMobileNav
              ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
              : "pb-6 lg:pb-8"
          }
        >
          <Outlet />
        </main>
      </div>

      {showMobileNav ? mobileNav : null}

      {overlay}
    </div>
  );
}
