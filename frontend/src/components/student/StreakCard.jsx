import { Flame } from "lucide-react";

import StatsCardSkeleton from "../loading/StatsCardSkeleton";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

const dayLabel = (value) => `${value} ${value === 1 ? "dia" : "dias"}`;

/**
 * Card do streak (sequência de treinos). O fogo fica "aceso" quando há sequência
 * ativa e apagado/neutro quando ela zerou, mantendo o incentivo discreto.
 */
export default function StreakCard({
  current = 0,
  longest = 0,
  loading = false,
  delay = 0,
}) {
  if (loading) {
    return <StatsCardSkeleton delay={delay} />;
  }

  const active = current > 0;

  return (
    <Card
      className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-transform hover:-translate-y-0.5 hover:shadow-popover"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="p-5">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br",
            active
              ? "from-orange-500/30 to-amber-500/10"
              : "from-muted/40 to-muted/10",
          )}
        >
          <Flame
            className={cn(
              "h-5 w-5",
              active ? "text-orange-500" : "text-muted-foreground/50",
            )}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Sequência de treinos</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {active ? dayLabel(current) : "Comece hoje"}
        </p>
        {longest > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Recorde: {dayLabel(longest)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
