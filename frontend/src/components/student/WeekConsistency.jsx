import { Dumbbell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CardSkeleton } from "../loading";
import { cn } from "../../lib/utils";
import QualityDot from "./QualityDot";

const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

const parseLocalDate = (value) => new Date(`${value}T00:00:00`);

/**
 * Faixa de consistência da última semana: por dia, se o aluno treinou e a cor
 * do sono registrado. Atende tanto "consistência" quanto "sono com indicador".
 */
export default function WeekConsistency({ days = [], sleep, loading = false }) {
  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <Card
      className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Sua semana</CardTitle>
        {sleep ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Sono recente
            <QualityDot level={sleep.level} />
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between gap-1">
          {days.map((day) => {
            const date = parseLocalDate(day.date);
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">
                  {WEEKDAY_INITIALS[date.getDay()]}
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    day.trained
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/40 text-muted-foreground/40",
                  )}
                  title={day.trained ? "Treino registrado" : "Sem treino"}
                >
                  {day.trained ? (
                    <Dumbbell className="h-4 w-4" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <QualityDot level={day.sleep_level} size="sm" />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <QualityDot level="good" /> Sono bom
          </span>
          <span className="flex items-center gap-1.5">
            <QualityDot level="attention" /> Atenção
          </span>
          <span className="flex items-center gap-1.5">
            <QualityDot level="bad" /> Sono ruim
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
