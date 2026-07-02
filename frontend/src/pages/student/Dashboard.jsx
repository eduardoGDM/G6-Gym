import { CalendarDays, HeartPulse, PlayCircle } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Card, CardContent } from "../../components/ui/card";

export default function Dashboard() {
  return (
    <PageContainer>
      <PageTitle
        eyebrow="Olá"
        title="Seu painel"
        description="Acompanhe seus treinos e evoluções em uma interface mais agradável."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Treinos desta semana", value: "4", icon: CalendarDays },
          { label: "Última atividade", value: "Hoje", icon: HeartPulse },
          { label: "Treino atual", value: "A/B", icon: PlayCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-border/80 bg-card/80">
              <CardContent className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
