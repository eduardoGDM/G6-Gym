import { Label } from "../ui/label";

/**
 * Campo de filtro: label pequeno (estilo "eyebrow") + controle, usado nas
 * barras de filtro das listagens. Centraliza o estilo de label de filtro
 * (text-xs em maiúsculas) antes repetido de forma hardcoded, mantendo-o
 * distinto do label de formulário (Field), que é maior.
 */
export function FilterField({ label, htmlFor, className, children }) {
  return (
    <div className={className}>
      <Label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
