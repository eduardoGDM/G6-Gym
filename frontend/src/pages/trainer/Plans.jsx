import { useQuery } from "@tanstack/react-query";
import { Check, CreditCard, Minus, TriangleAlert, Users } from "lucide-react";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ErrorState from "../../components/loading/ErrorState";
import Skeleton from "../../components/loading/Skeleton";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import trainerPlanService from "../../services/TrainerPlanService";
import { cn } from "../../lib/utils";
import { formatUsage, isOverLimit } from "../../utils/plan";

/**
 * Features que a escada trava. São só duas, e ambas por custo marginal
 * (storage e banda) — o resto do produto está em todos os planos.
 * Ver docs/regras-planos.md.
 */
const GATED_FEATURES = [
  { key: "photos", label: "Fotos na anamnese" },
  { key: "videos", label: "Vídeos na anamnese" },
];

/** Presente em todos os degraus, inclusive no Free. */
const INCLUDED_EVERYWHERE = [
  "Prescrição completa de treino (séries, RIR, técnicas, cadência)",
  "Anamnese",
  "Avaliação física com IMC, RCQ e variação entre avaliações",
  "Check-in de treino e check-in diário de sono e dieta",
  "Gráficos de evolução de exercício",
  "Ficha de treino em PDF",
];

const formatDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const formatLimit = (limit) =>
  limit === null || limit === undefined
    ? "Alunos ilimitados"
    : `${limit} aluno${limit > 1 ? "s" : ""}`;

function CurrentPlanCard({ current }) {
  const plan = current?.plan;
  const usage = current?.usage;
  const overLimit = isOverLimit(usage?.students, usage?.students_limit);
  const endsAt = formatDate(current?.subscription?.ends_at);
  const daysLeft = current?.subscription?.days_left;

  return (
    <Card className="border-border/80 bg-card/90">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Seu plano atual</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {plan?.name || "Sem plano"}
              </p>
              {plan?.student_limit === null ? (
                <Badge variant="outline">Alunos ilimitados</Badge>
              ) : null}
            </div>
            {endsAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Válido até {endsAt}
                {daysLeft !== null && daysLeft !== undefined
                  ? ` — ${daysLeft} dia(s) restante(s)`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="sm:text-right">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground sm:justify-end">
            <Users className="h-4 w-4" />
            Alunos cadastrados
          </p>
          <p
            className={cn(
              "mt-1 text-3xl font-semibold tracking-tight",
              overLimit ? "text-destructive" : "text-foreground",
            )}
          >
            {plan
              ? formatUsage(usage?.students, usage?.students_limit)
              : (usage?.students ?? 0)}
          </p>
        </div>
      </CardContent>

      {overLimit ? (
        <div className="flex items-start gap-2 border-t border-border/80 px-6 py-4 text-sm text-muted-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>
            Você está acima da capacidade do seu plano. Nada foi bloqueado e
            nenhum aluno foi removido — fale com o suporte para subir de plano.
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function PlanCard({ plan }) {
  return (
    <Card
      className={cn(
        "flex flex-col border-border/80 bg-card/90 transition-transform hover:-translate-y-0.5",
        plan.is_current && "border-primary/60 ring-1 ring-primary/40",
      )}
    >
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-semibold text-foreground">{plan.name}</p>
          {plan.is_current ? <Badge>Seu plano</Badge> : null}
        </div>

        {/* Sem preço: a contratação é feita pelo suporte, não pelo sistema. */}
        <p className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <Users className="h-5 w-5 shrink-0 text-primary" />
          {formatLimit(plan.student_limit)}
        </p>

        <ul className="mt-5 space-y-2 border-t border-border/80 pt-5">
          {GATED_FEATURES.map((feature) => {
            const enabled = plan.features[feature.key];

            return (
              <li
                key={feature.key}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  enabled ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {enabled ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Minus className="h-4 w-4 shrink-0" />
                )}
                {feature.label}
              </li>
            );
          })}
        </ul>

        {plan.student_limit === null ? (
          <p className="mt-auto pt-5 text-xs text-muted-foreground">
            Sem teto de alunos.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function Plans() {
  const {
    data: current,
    isLoading: loadingCurrent,
    isError: currentError,
    refetch: refetchCurrent,
  } = useQuery({
    queryKey: ["trainer-plan"],
    queryFn: trainerPlanService.get,
  });

  const {
    data: plans,
    isLoading: loadingPlans,
    isError: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ["trainer-plans"],
    queryFn: trainerPlanService.listPlans,
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <PageTitle
          eyebrow="Assinatura"
          title="Planos"
          description="Sua capacidade de alunos e o que cada plano libera."
        />
      </div>

      {loadingCurrent ? (
        <Skeleton className="h-[148px] w-full rounded-2xl" />
      ) : currentError ? (
        <Card className="border-border/80 bg-card/90">
          <CardContent className="p-6">
            <ErrorState onRetry={refetchCurrent} />
          </CardContent>
        </Card>
      ) : (
        <CurrentPlanCard current={current} />
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Comparar planos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Os planos se diferenciam por capacidade de alunos. Só fotos e vídeos
          dependem do plano — todo o resto está incluído em todos eles. Para
          valores e troca de plano, fale com o suporte.
        </p>

        {loadingPlans ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : plansError ? (
          <Card className="mt-4 border-border/80 bg-card/90">
            <CardContent className="p-6">
              <ErrorState onRetry={refetchPlans} />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(plans || []).map((plan) => (
              <PlanCard key={plan.code} plan={plan} />
            ))}
          </div>
        )}
      </div>

      <Card className="mt-8 border-border/80 bg-card/90">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Incluído em todos os planos
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {INCLUDED_EVERYWHERE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-border/80 pt-4 text-sm text-muted-foreground">
            A troca de plano é feita pelo suporte — ainda não há contratação pelo
            sistema.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
