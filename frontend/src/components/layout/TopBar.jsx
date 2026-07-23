import { Menu, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "../../lib/utils";
import useAuthStore from "../../store/authStore";

const USER_CHIP_CLASSES =
  "flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:pr-4";

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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <UserCircle2 className="h-5 w-5" />
      </div>

      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-semibold text-foreground">{userName}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-border bg-background/80 backdrop-blur-xl">
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8",
          isDesktop ? "min-h-[72px]" : "min-h-[64px]",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {!isDesktop ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          {/* No desktop a marca já vive na sidebar; só exibimos aqui no mobile,
              onde a sidebar fica fora da tela. */}
          {!isDesktop ? (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-lg font-bold tracking-tight text-foreground">
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

        <div className="flex items-center gap-2 sm:gap-3">
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
