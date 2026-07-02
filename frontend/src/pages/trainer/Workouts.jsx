import { Dumbbell, Plus } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function Treinos() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Planejamento"
          title="Treinos"
          description="Gerencie os treinos dos alunos com uma interface mais limpa e prática."
        />

        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4" />
          Novo treino
        </Button>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Nenhum treino cadastrado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre um novo treino para começar a organizar as rotinas.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
