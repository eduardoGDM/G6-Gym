import { cn } from "../../lib/utils";

/**
 * Seção de formulário: título + descrição opcional + conteúdo, com
 * espaçamento e divisória padronizados. Centraliza o padrão de "seção maior"
 * usado dentro dos formulários (ex.: "Exercícios do treino"), garantindo um
 * respiro consistente entre o título, a descrição e os campos.
 *
 * @param {React.ReactNode} title        Título da seção.
 * @param {React.ReactNode} [description] Texto de apoio abaixo do título.
 * @param {React.ReactNode} [action]      Elemento alinhado à direita do título.
 * @param {boolean} [divider=true]        Exibe a divisória superior (border-t).
 */
export function FormSection({
  title,
  description,
  action,
  divider = true,
  className,
  children,
}) {
  return (
    <section
      className={cn(
        "space-y-4",
        divider && "border-t border-border/80 pt-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
