import { ArrowLeft, CalendarDays, Mail, Ruler, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import DetailsSkeleton from "../../../components/loading/DetailsSkeleton";
import ErrorState from "../../../components/loading/ErrorState";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import studentsService from "../../../services/StudentsService";
import AnamnesisSection from "./components/AnamnesisSection";
import ExerciseEvolutionSection from "./components/ExerciseEvolutionSection";

export default function StudentsShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(false);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await studentsService.getById(id);
      setStudent(data);
    } catch {
      setError(true);
      toast.error("Não foi possível carregar o student.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Visualização"
          title="Detalhes do aluno"
          description="Consulte todos os dados cadastrados para este student."
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/students")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {student?.user?.name || "Aluno"}
          </CardTitle>
          <CardDescription>
            Informações completas registradas no cadastro.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {loading ? (
            <DetailsSkeleton blocks={4} linesPerBlock={2} />
          ) : error ? (
            <ErrorState onRetry={loadStudent} />
          ) : !student ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
              Aluno não encontrado.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  Dados básicos
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    <span className="font-medium">Nome:</span>{" "}
                    {student.user?.name || "—"}
                  </p>
                  <p>
                    <span className="font-medium">E-mail:</span>{" "}
                    {student.user?.email || "—"}
                  </p>
                  <p>
                    <span className="font-medium">CPF:</span>{" "}
                    {student.cpf || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Sexo:</span>{" "}
                    {student.gender || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Contato
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    <span className="font-medium">Telefone:</span>{" "}
                    {student.phone || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Data de nascimento:</span>{" "}
                    {student.birth_date || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  Medidas físicas
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    <span className="font-medium">Altura:</span>{" "}
                    {student.height ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Peso atual:</span>{" "}
                    {student.current_weight ?? "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Observações
                </div>
                <p className="text-sm leading-6 text-foreground">
                  {student.observations || "Nenhuma observação cadastrada."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && !error && student ? (
        <>
          <AnamnesisSection studentId={id} readOnly />
          <ExerciseEvolutionSection studentId={id} />
        </>
      ) : null}
    </PageContainer>
  );
}
