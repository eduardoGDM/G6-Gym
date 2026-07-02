import { BookOpenText } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Card, CardContent } from "../../components/ui/card";

export default function MyWorkouts() {
  return (
    <PageContainer>
      <PageTitle
        eyebrow="Meus dados"
        title="Meus treinos"
        description="Veja aqui os treinos atribuídos para você."
      />

      <Card className="border-border/80 bg-card/80">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Nenhum treino disponível no momento</p>
            <p className="text-sm text-muted-foreground">
              Quando seu trainer publicar um treino, ele vai aparecer aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
