import { useQuery } from "@tanstack/react-query";
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
import { cn } from "../../../lib/utils";
import physicalAssessmentsService from "../../../services/PhysicalAssessmentsService";
import studentsService from "../../../services/StudentsService";
import AnamnesisSection from "./components/AnamnesisSection";
import ExerciseEvolutionSection from "./components/ExerciseEvolutionSection";
import PhysicalAssessmentSection from "./components/PhysicalAssessmentSection";
import { formatDate } from "./utils";

// Card de agrupamento de dados: mesmo padrão visual (borda, raio, padding e
// cabeçalho com ícone) para todas as seções da tela.
function InfoCard({ icon: Icon, title, className, children }) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        {title}
      </div>
      {children}
    </section>
  );
}

// Par label/valor com hierarquia clara: label discreto acima, valor em
// destaque abaixo. `break-words` evita que e-mails/valores longos estourem.
function InfoRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium text-foreground">
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

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
      toast.error("Não foi possível carregar o aluno.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  // O peso atual não é mais um campo do cadastro: vem da avaliação física mais
  // recente. A query compartilha a chave com PhysicalAssessmentSection, então a
  // lista é buscada uma única vez.
  const { data: assessments } = useQuery({
    queryKey: ["student-physical-assessments", id],
    queryFn: () => physicalAssessmentsService.list(id),
    enabled: Boolean(id),
  });

  const latestAssessment = assessments?.[0] || null;
  const latestWeight = latestAssessment?.measures?.weight?.value ?? null;

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Visualização"
          title="Detalhes do aluno"
          description="Consulte todos os dados cadastrados para este aluno."
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <InfoCard icon={UserRound} title="Dados básicos">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Nome" value={student.user?.name} />
                  <InfoRow label="E-mail" value={student.user?.email} />
                  <InfoRow label="CPF" value={student.cpf} />
                  <InfoRow label="Sexo" value={student.gender} />
                </dl>
              </InfoCard>

              <InfoCard icon={Mail} title="Contato">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Telefone" value={student.phone} />
                  <InfoRow
                    label="Data de nascimento"
                    value={formatDate(student.birth_date)}
                  />
                </dl>
              </InfoCard>

              <InfoCard icon={Ruler} title="Medidas físicas">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Altura" value={student.height} />
                  <InfoRow
                    label="Peso atual"
                    value={
                      latestWeight === null || latestWeight === undefined ? (
                        "—"
                      ) : (
                        <>
                          {latestWeight}
                          {latestAssessment ? (
                            <span className="block text-xs font-normal text-muted-foreground">
                              avaliação de{" "}
                              {formatDate(latestAssessment.assessment_date)}
                            </span>
                          ) : null}
                        </>
                      )
                    }
                  />
                </dl>
              </InfoCard>

              <InfoCard
                icon={CalendarDays}
                title="Observações"
                className="sm:col-span-2 lg:col-span-3"
              >
                <p className="max-h-56 overflow-y-auto whitespace-pre-line break-words text-sm leading-6 text-foreground">
                  {student.observations || "Nenhuma observação cadastrada."}
                </p>
              </InfoCard>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && !error && student ? (
        <>
          <AnamnesisSection studentId={id} readOnly />
          <PhysicalAssessmentSection studentId={id} readOnly />
          <ExerciseEvolutionSection studentId={id} />
        </>
      ) : null}
    </PageContainer>
  );
}
