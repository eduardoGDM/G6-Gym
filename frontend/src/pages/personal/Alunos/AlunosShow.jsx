import { ArrowLeft, CalendarDays, Mail, Phone, Ruler, Scale, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../api/axios";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

export default function AlunosShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarAluno = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/personal/perfil-alunos/${id}`);
        setAluno(data);
      } catch (error) {
        toast.error("Não foi possível carregar o aluno.");
      } finally {
        setLoading(false);
      }
    };

    carregarAluno();
  }, [id]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Visualização"
          title="Detalhes do aluno"
          description="Consulte todos os dados cadastrados para este aluno."
        />

        <Button variant="outline" className="w-full md:w-auto" onClick={() => navigate("/personal/alunos")}>
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">{aluno?.usuario?.name || "Aluno"}</CardTitle>
          <CardDescription>Informações completas registradas no cadastro.</CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Carregando aluno...</div>
          ) : !aluno ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Aluno não encontrado.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  Dados básicos
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p><span className="font-medium">Nome:</span> {aluno.usuario?.name || "—"}</p>
                  <p><span className="font-medium">E-mail:</span> {aluno.usuario?.email || "—"}</p>
                  <p><span className="font-medium">CPF:</span> {aluno.cpf || "—"}</p>
                  <p><span className="font-medium">Sexo:</span> {aluno.sexo || "—"}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Contato
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p><span className="font-medium">Telefone:</span> {aluno.telefone || "—"}</p>
                  <p><span className="font-medium">Data de nascimento:</span> {aluno.data_nascimento || "—"}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  Medidas físicas
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p><span className="font-medium">Altura:</span> {aluno.altura ?? "—"}</p>
                  <p><span className="font-medium">Peso atual:</span> {aluno.peso_atual ?? "—"}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Observações
                </div>
                <p className="text-sm leading-6 text-foreground">
                  {aluno.observacoes || "Nenhuma observação cadastrada."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
