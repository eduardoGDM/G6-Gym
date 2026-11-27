import { Link, useLocation } from "react-router-dom";

import { cn } from "../../lib/utils";

function isActivePath(pathname, path, end = false) {
  if (end) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Navegação principal no mobile, na zona do polegar.
 *
 * Substitui a gaveta (hambúrguer no topo-esquerdo) para quem usa o app de pé na
 * academia: os destinos ficam na borda inferior, com alvo de 56px de altura.
 *
 * Quem decide exibir é o `RoleLayout`, pelo mesmo `isDesktop` (900px) que
 * governa a sidebar — um `hidden` por media query aqui poderia divergir do
 * corte em JS e deixar as duas navegações na tela ao mesmo tempo.
 *
 * Cabem no máximo 5 destinos: acima disso os rótulos quebram em 360px. O que
 * não cabe aqui (sair da conta, telas secundárias) vive na tela de perfil.
 *
 * O item ativo é marcado em **tinta** (não em Anilha): a Anilha é reservada ao
 * conteúdo, onde ela significa "a ação de agora", e a barra apareceria junto
 * com ela em quase toda tela — duas Anilhas na mesma vista. O sinal aqui é o
 * traço de tinta no topo da aba mais o peso do rótulo, então não depende de
 * cor.
 */
export default function MobileTabBar({ items }) {
  const location = useLocation();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        {items.map((item) => {
          const active = isActivePath(location.pathname, item.path, item.end);
          const Icon = item.icon;

          return (
            <li key={item.path} className="min-w-0 flex-1">
              <Link
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 pt-1.5 pb-1 transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Traço de tinta sobre a aba ativa: o sinal que não depende de
                    cor. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-[3px] origin-left",
                    active ? "bg-foreground animate-unroll" : "bg-transparent",
                  )}
                />

                <Icon
                  aria-hidden="true"
                  className="h-[22px] w-[22px] shrink-0"
                  strokeWidth={active ? 2.4 : 1.9}
                />

                <span
                  className={cn(
                    "max-w-full truncate text-[10px] uppercase tracking-[0.06em] ficha-mono",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.shortLabel || item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
