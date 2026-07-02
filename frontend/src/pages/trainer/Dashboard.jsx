import { Activity, ArrowUpRight, CalendarCheck2, Users } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";

const stats = [
  {
    label: "Alunos ativos",
    value: "128",
    icon: Users,
    tone: "from-primary/30 to-primary/10",
  },
  {
    label: "Treinos hoje",
    value: "24",
    icon: CalendarCheck2,
    tone: "from-secondary/30 to-secondary/10",
  },
  {
    label: "Taxa de presença",
    value: "92%",
    icon: Activity,
    tone: "from-emerald-500/25 to-emerald-500/10",
  },
];

export default function Dashboard() {
  return (
    <PageContainer>
      <PageTitle
        eyebrow="Visão geral"
        title="Dashboard do Personal"
        description="Acompanhe os principais indicadores da academia em um painel mais limpo e objetivo."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/80 bg-card/80">
              <CardContent className="p-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone}`}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="gap-1 border-primary/20 text-primary"
                  >
                    +8%
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Resumo da semana
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Rotina organizada e acompanhamento constante
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use este espaço para destacar evolução, metas e qualquer indicador
              que ajude o trainer a tomar decisões rápidas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Acesso rápido
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
                <span>Alunos</span>
                <span className="text-primary">Gerenciar</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
                <span>Treinos</span>
                <span className="text-primary">Criar</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
                <span>Exercícios</span>
                <span className="text-primary">Cadastrar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
