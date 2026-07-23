import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";

import trainerPlanService from "../../services/TrainerPlanService";
import { formatPlanPrice, formatUsage, isOverLimit } from "../../utils/plan";
import Skeleton from "../loading/Skeleton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const formatDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

/**
 * Plano do personal — puramente informativo.
 *
 * Não há contratação, troca nem bloqueio: hoje quem atribui o plano é o admin,
 * manualmente. O card existe para o personal enxergar em que degrau está e
 * quanto da capacidade já usou.
 */
export default function PlanCard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trainer-plan"],
    queryFn: trainerPlanService.get,
  });

  if (isLoading) {
    return <Skeleton className="h-[132px] w-full rounded-2xl" />;
  }

  // Sem este ramo, uma falha na requisição renderizaria "0 alunos" — número
  // errado com cara de número certo, que é pior do que não mostrar nada.
  if (isError) {
    return (
      <Card className="border-border/80 bg-card/80">
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center text-sm text-muted-foreground sm:flex-row sm:justify-center">
          Não foi possível carregar os dados do seu plano.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const plan = data?.plan;
  const usage = data?.usage;
  const overLimit = isOverLimit(usage?.students, usage?.students_limit);
  const endsAt = formatDate(data?.subscription?.ends_at);

  return (
    <Card className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Seu plano</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {plan?.name || "Sem plano"}
              </p>
              {plan ? (
                <Badge variant="outline">
                  {formatPlanPrice(plan.price_cents)}
                </Badge>
              ) : null}
            </div>
            {endsAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Válido até {endsAt}
              </p>
            ) : null}
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-sm text-muted-foreground">Alunos cadastrados</p>
          <p
            className={
              overLimit
                ? "mt-1 text-2xl font-semibold tracking-tight text-destructive"
                : "mt-1 text-2xl font-semibold tracking-tight text-foreground"
            }
          >
            {/* Sem plano não é o mesmo que ilimitado: mostrar "3/∞" prometeria
                uma capacidade que não foi contratada. */}
            {plan
              ? formatUsage(usage?.students, usage?.students_limit)
              : (usage?.students ?? 0)}
          </p>
          {plan ? null : (
            <p className="mt-1 text-xs text-muted-foreground">
              Fale com o suporte para escolher um plano.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
