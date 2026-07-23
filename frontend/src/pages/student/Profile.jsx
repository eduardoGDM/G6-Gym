import { useQuery } from "@tanstack/react-query";
import { Mail, Ruler, UserRound } from "lucide-react";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import DetailsSkeleton from "../../components/loading/DetailsSkeleton";
import ErrorState from "../../components/loading/ErrorState";
import Skeleton from "../../components/loading/Skeleton";
import AssessmentCard from "../../components/physicalAssessment/AssessmentCard";
import {
  formatAssessmentDate,
  formatMeasureValue,
} from "../../components/physicalAssessment/fields";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import studentProfileService from "../../services/StudentProfileService";

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="space-y-3 text-sm text-foreground">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value || "—"}
    </p>
  );
}

export default function Profile() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentProfileService.get(),
  });

  const {
    data: assessments,
    isLoading: loadingAssessments,
    isError: assessmentsError,
    refetch: refetchAssessments,
  } = useQuery({
    queryKey: ["student-own-physical-assessments"],
    queryFn: () => studentProfileService.getPhysicalAssessments(),
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <PageTitle
          eyebrow="Perfil"
          title="Meu perfil"
          description="Seus dados de cadastro e o histórico das suas avaliações físicas."
        />
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">{profile?.name || "Aluno"}</CardTitle>
          <CardDescription>
            Para alterar qualquer dado deste cadastro, fale com o seu personal.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {isLoading ? (
            <DetailsSkeleton blocks={3} linesPerBlock={3} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <InfoBlock icon={UserRound} title="Dados básicos">
                <InfoLine label="Nome" value={profile?.name} />
                <InfoLine label="CPF" value={profile?.cpf} />
                <InfoLine label="Sexo" value={profile?.gender} />
                <InfoLine
                  label="Data de nascimento"
                  value={formatAssessmentDate(profile?.birth_date)}
                />
              </InfoBlock>

              <InfoBlock icon={Mail} title="Contato">
                <InfoLine label="E-mail" value={profile?.email} />
                <InfoLine label="Telefone" value={profile?.phone} />
                <InfoLine label="Personal" value={profile?.trainer?.name} />
              </InfoBlock>

              <InfoBlock icon={Ruler} title="Medidas">
                <InfoLine
                  label="Altura"
                  value={profile?.height ? `${profile.height} m` : null}
                />
                <p>
                  <span className="font-medium">Peso atual:</span>{" "}
                  {profile?.latest_weight
                    ? `${formatMeasureValue(profile.latest_weight)} kg`
                    : "—"}
                  {profile?.latest_weight_date ? (
                    <span className="text-muted-foreground">
                      {" "}
                      (avaliação de{" "}
                      {formatAssessmentDate(profile.latest_weight_date)})
                    </span>
                  ) : null}
                </p>
              </InfoBlock>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-2xl border border-border/80 bg-card/90 shadow-card">
        <div className="flex items-center gap-2 border-b border-border/80 px-6 py-6 sm:px-8">
          <Ruler className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              Minhas avaliações físicas
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Cada medida mostra a variação em relação à avaliação anterior.
            </p>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {loadingAssessments ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : assessmentsError ? (
            <ErrorState onRetry={refetchAssessments} />
          ) : !assessments?.length ? (
            <p className="rounded-2xl border border-dashed border-border/80 px-6 py-10 text-center text-sm text-muted-foreground">
              Você ainda não possui avaliações físicas registradas. Seu personal
              cadastra a primeira quando fizer as medições.
            </p>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment, index) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  isLatest={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
