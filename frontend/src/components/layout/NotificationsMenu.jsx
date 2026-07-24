import { Bell, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Menu de notificações do topo. O controle é totalmente funcional (abre/fecha,
 * clique-fora, Escape); a fonte de dados de notificações ainda depende de
 * backend, então por ora exibe um empty-state honesto em vez de dados falsos.
 */
export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notificações"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-expanded:bg-accent aria-expanded:text-foreground"
      >
        <Bell className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notificações"
          className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-border bg-popover shadow-popover animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 sm:w-80"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellOff className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Tudo em dia
            </p>
            <p className="text-xs text-muted-foreground">
              Você não tem novas notificações.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
