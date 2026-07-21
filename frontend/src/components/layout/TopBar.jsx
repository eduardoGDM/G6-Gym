import { Menu, UserCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Topbar({
  onMenuClick,
  title = "G6Fit",
  subtitle = "",
  isDesktop,
  roleLabel = "Personal",
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
          isDesktop ? "min-h-[72px]" : "min-h-[64px]",
        )}
      >
        <div className="flex items-center gap-3">
          {!isDesktop ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition hover:bg-accent"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          <div>
            <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            {isDesktop ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-1.5 py-1.5 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UserCircle2 className="h-5 w-5" />
            </div>

            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-foreground">Usuario</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
