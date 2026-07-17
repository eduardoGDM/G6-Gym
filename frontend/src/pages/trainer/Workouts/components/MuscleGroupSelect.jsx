import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";

export default function MuscleGroupSelect({
  options = [],
  value = [],
  onChange,
  loading = false,
  placeholder = "Selecione os grupos musculares",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = value.map(String);
  const selectedOptions = options.filter((option) =>
    selectedIds.includes(String(option.id)),
  );

  const toggleOption = (id) => {
    const idStr = String(id);
    const next = selectedIds.includes(idStr)
      ? value.filter((item) => String(item) !== idStr)
      : [...value, id];
    onChange(next);
  };

  const removeOption = (id) => {
    onChange(value.filter((item) => String(item) !== String(id)));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className={cn(!selectedOptions.length && "text-muted-foreground/70")}>
          {selectedOptions.length
            ? `${selectedOptions.length} grupo(s) selecionado(s)`
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Carregando...
            </p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum grupo muscular cadastrado.
            </p>
          ) : (
            options.map((option) => {
              const checked = selectedIds.includes(String(option.id));

              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
                >
                  {option.name}
                  {checked ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}

      {selectedOptions.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="gap-1 pr-1.5">
              {option.name}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remover ${option.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
