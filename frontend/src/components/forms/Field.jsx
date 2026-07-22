import { cn } from "../../lib/utils";
import { Label } from "../ui/label";

/**
 * Campo de formulário padrão: Label + controle + mensagem de erro.
 *
 * Centraliza o espaçamento (label → campo), o texto de apoio (hint) e o
 * estilo das mensagens de erro para manter todos os formulários do sistema
 * visualmente consistentes. O controle (Input, Select, Textarea, etc.) é
 * passado como children, portanto nenhum comportamento é alterado.
 *
 * @param {string} [label]   Texto do label.
 * @param {string} [htmlFor] id do controle associado ao label.
 * @param {string} [error]   Mensagem de erro (ex.: errors.campo?.message).
 * @param {string} [hint]    Texto de apoio exibido entre o label e o controle.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  labelClassName,
  children,
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="space-y-1.5">
        {label ? (
          <Label htmlFor={htmlFor} className={labelClassName}>
            {label}
          </Label>
        ) : null}
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        {children}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
