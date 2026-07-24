import { ArrowDown, ArrowUp } from "lucide-react";

import StatsCardSkeleton from "../loading/StatsCardSkeleton";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

/**
 * Indicador compacto no estilo da referência: número em destaque, rótulo
 * abaixo e ícone pequeno "nu" (sem caixa) no canto superior direito.
 *
 * `trend` é opcional: { label, direction: "up"|"down" }. Só é exibido quando
 * fornecido — não fabricamos variação quando o backend não a envia.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  loading = false,
  delay = 0,
}) {
  if (loading) {
    return <StatsCardSkeleton delay={delay} />;
  }

  const TrendIcon = trend?.direction === "down" ? ArrowDown : ArrowUp;
  const trendPositive = trend?.direction !== "down";

  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 p-4 duration-300 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-border/70 sm:p-5"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[26px] font-bold leading-none tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
        {Icon ? (
          <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground/60" />
        ) : null}
      </div>

      <p className="mt-2 truncate text-sm text-muted-foreground">{label}</p>

      {trend ? (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
            trendPositive ? "text-success" : "text-muted-foreground",
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trend.label}
        </p>
      ) : null}
    </Card>
  );
}
