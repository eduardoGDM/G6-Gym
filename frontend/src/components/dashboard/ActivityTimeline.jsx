import EmptyState from "../loading/EmptyState";
import { Card, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";

// Cor aplicada APENAS no círculo do ícone (o resto do item é neutro).
const TONES = {
  red: "bg-primary/15 text-primary",
  green: "bg-success/15 text-success",
  orange: "bg-warning/15 text-warning",
  gray: "bg-muted text-muted-foreground",
  blue: "bg-info/15 text-info",
  purple: "bg-violet-500/15 text-violet-400",
};

function TimelineSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-3/5 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/**
 * Lista/timeline de atividade recente. Cada item traz um ícone colorido por
 * tipo (círculo), nome, descrição e data/horário à direita. Puramente
 * apresentacional: o `onClick` recebido preserva a navegação existente.
 */
export default function ActivityTimeline({
  title,
  items = [],
  loading = false,
  action,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  delay = 0,
}) {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 flex flex-col overflow-hidden duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-center justify-between gap-3 p-5 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </div>

      <div className="flex-1 px-2 pb-2">
        {loading ? (
          <TimelineSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const Wrapper = item.onClick ? "button" : "div";

              return (
                <li key={item.id}>
                  <Wrapper
                    type={item.onClick ? "button" : undefined}
                    onClick={item.onClick}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      item.onClick
                        ? "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        : "",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        TONES[item.tone] || TONES.gray,
                      )}
                    >
                      {Icon ? <Icon className="h-[18px] w-[18px]" /> : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.action}
                      </span>
                    </span>

                    {item.whenLabel || item.whenTime ? (
                      <span className="shrink-0 whitespace-nowrap text-right leading-tight">
                        {item.whenLabel ? (
                          <span className="block text-xs font-medium text-foreground/80">
                            {item.whenLabel}
                          </span>
                        ) : null}
                        {item.whenTime ? (
                          <span className="block text-[11px] text-muted-foreground">
                            {item.whenTime}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
