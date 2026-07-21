import { X } from "lucide-react";

import { cn } from "../../lib/utils";

export function Dialog({ open, onClose, children, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div
        className={cn(
          "relative max-h-[90vh] w-full overflow-auto rounded-2xl border border-border/80 bg-card shadow-modal animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogCloseButton({ onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Fechar"
      className={cn(
        "absolute right-4 top-4 z-10 rounded-lg bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
}
