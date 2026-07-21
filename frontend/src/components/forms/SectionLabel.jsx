import { cn } from "../../lib/utils";

/**
 * Rótulo de subseção (estilo "eyebrow"): texto pequeno, em maiúsculas e
 * espaçado, usado para nomear grupos de campos dentro de um card ou seção
 * (ex.: "Observações", "Fotos", "Sono"). Centraliza o estilo antes repetido
 * de forma hardcoded em várias telas. Aceita children (inclusive ícones).
 */
export function SectionLabel({ className, ...props }) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
