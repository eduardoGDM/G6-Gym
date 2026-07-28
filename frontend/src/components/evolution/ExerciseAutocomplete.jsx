import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

/**
 * Autocomplete de busca por exercício: input de texto com dropdown filtrado em
 * tempo real. Substitui o antigo fluxo "grupo muscular → exercício", permitindo
 * localizar o exercício diretamente pelo nome. A filtragem é feita no cliente
 * sobre a lista de exercícios já executados pelo aluno.
 */
export default function ExerciseAutocomplete({
  exercises = [],
  value,
  onChange,
  loading = false,
  disabled = false,
  placeholder = "Buscar exercício...",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const selected = useMemo(
    () => exercises.find((exercise) => String(exercise.id) === String(value)) || null,
    [exercises, value],
  );

  // Enquanto o dropdown está aberto o input reflete o texto de busca; fechado,
  // volta a exibir o exercício selecionado (sem precisar sincronizar via efeito).
  const inputValue = open ? query : selected ? selected.name : "";

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(term),
    );
  }, [exercises, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDropdown = () => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  };

  const handleSelect = (exercise) => {
    onChange(String(exercise.id));
    setQuery(exercise.name);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        handleSelect(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={inputValue}
        disabled={disabled}
        placeholder={placeholder}
        className="pl-10 pr-16"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Limpar exercício"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <ChevronDown className="pointer-events-none h-4 w-4 text-muted-foreground" />
      </div>

      {open && !disabled ? (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-card animate-in fade-in duration-150">
          {loading ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              Nenhum exercício encontrado.
            </p>
          ) : (
            filtered.map((exercise, index) => {
              const isSelected = String(exercise.id) === String(value);
              const isActive = index === activeIndex;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(exercise)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {exercise.name}
                    </span>
                    {exercise.muscle_group?.name ? (
                      <span className="block text-xs text-muted-foreground">
                        {exercise.muscle_group.name}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
