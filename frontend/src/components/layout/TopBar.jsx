import { ChevronDown, Menu, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import NotificationsMenu from "./NotificationsMenu";

const USER_CHIP_CLASSES =
  "flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:pr-3";

export default function Topbar({
  onMenuClick,
  title = "G6Fit",
  subtitle = "",
  isDesktop,
  roleLabel = "Personal",
  profilePath,
}) {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || "Usuário";

  const userChip = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <UserCircle2 className="h-5 w-5" />
      </div>

      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-semibold text-foreground">{userName}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>

      <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-[56px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {!isDesktop ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          {/* No desktop a marca já vive na sidebar; só exibimos aqui no mobile. */}
          {!isDesktop ? (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-bold tracking-tight text-foreground">
                {title}
              </p>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationsMenu />

          {/* Só vira link quando o papel tem uma tela de perfil (hoje, o aluno). */}
          {profilePath ? (
            <Link
              to={profilePath}
              aria-label={`Perfil de ${userName}`}
              className={USER_CHIP_CLASSES}
            >
              {userChip}
            </Link>
          ) : (
            <div className={USER_CHIP_CLASSES}>{userChip}</div>
          )}
        </div>
      </div>
    </header>
  );
}
