import {
  ArrowLeft,
  Dumbbell,
  MonitorPlay,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../api/axios";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function ExerciciosShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exercicio, setExercicio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarExercicio = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/personal/exercicios/${id}`);
        setExercicio(data);
      } catch (error) {
        toast.error("Não foi possível carregar o exercício.");
      } finally {
        setLoading(false);
      }
    };

    carregarExercicio();
  }, [id]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Visualização"
          title="Detalhes do exercício"
          description="Consulte todas as informações cadastradas para este exercício."
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/personal/exercicios")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {exercicio?.nome || "Exercício"}
          </CardTitle>
          <CardDescription>
            Informações completas registradas no cadastro.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Carregando exercício...
            </div>
          ) : !exercicio ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Exercício não encontrado.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <NotebookPen className="h-4 w-4" />
                    Descrição
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {exercicio.descricao || "Nenhuma descrição cadastrada."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Equipamento
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {exercicio.equipamento || "Nenhum equipamento informado."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    Grupo muscular
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {exercicio.grupoMuscular?.nome || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <MonitorPlay className="h-4 w-4" />
                    Vídeo
                  </div>
                  <p className="mt-3 text-sm text-foreground">
                    {exercicio.video_url ? (
                      <a
                        href={exercicio.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {exercicio.video_url}
                      </a>
                    ) : (
                      "Nenhuma URL de vídeo cadastrada."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
