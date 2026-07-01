import { ClipboardList } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Card, CardContent } from "../../components/ui/card";

export default function Treino() {
  return (
    <PageContainer>
      <PageTitle
        eyebrow="Detalhes"
        title="Treino"
        description="Detalhes do treino selecionado."
      />

      <Card className="border-border/80 bg-card/80">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Treino em construção</p>
            <p className="text-sm text-muted-foreground">
              Conecte esta tela com os dados da API para exibir exercícios, séries e observações.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
