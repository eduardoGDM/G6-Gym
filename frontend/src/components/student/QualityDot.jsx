import { cn } from "../../lib/utils";

// Mapeia o nível vindo do backend (good/attention/bad) para a cor do indicador.
// A regra de negócio (faixas 0–10) vive no backend; aqui só traduzimos em cor.
const LEVEL_STYLES = {
  good: { dot: "bg-success", label: "Bom" },
  attention: { dot: "bg-warning", label: "Atenção" },
  bad: { dot: "bg-destructive", label: "Ruim" },
};

const SIZES = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

/**
 * Bolinha colorida do indicador de qualidade (sono/dieta).
 * Sem nível definido, exibe um ponto neutro (cinza).
 */
export default function QualityDot({ level, size = "md", className }) {
  const style = LEVEL_STYLES[level];

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        SIZES[size] || SIZES.md,
        style ? style.dot : "bg-muted-foreground/30",
        className,
      )}
      role="img"
      aria-label={style ? style.label : "Sem registro"}
      title={style ? style.label : "Sem registro"}
    />
  );
}
