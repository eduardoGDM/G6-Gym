import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "../ui/button";

export default function ErrorState({
  title = "Não foi possível carregar estas informações.",
  description,
  onRetry,
  className,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300 ${className || ""}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
