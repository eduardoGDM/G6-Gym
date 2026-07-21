import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function ConfirmDialog({
  open,
  title = "Confirmar ação",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <Card className="relative w-full max-w-sm border-border/80 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <CardContent className="p-6">
          <div
            className={
              "flex h-12 w-12 items-center justify-center rounded-2xl " +
              (variant === "destructive"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary")
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Aguarde..." : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
