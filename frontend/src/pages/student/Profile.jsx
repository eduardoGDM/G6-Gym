import { useQuery } from "@tanstack/react-query";
import { ClipboardList, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import TapeDivider from "../../components/ficha/TapeDivider";
import ErrorState from "../../components/loading/ErrorState";
import Skeleton from "../../components/loading/Skeleton";
import AssessmentCard from "../../components/physicalAssessment/AssessmentCard";
import {
  formatAssessmentDate,
  formatMeasureValue,
} from "../../components/physicalAssessment/fields";
import { useLogout } from "../../hooks/useLogout";
import { cn } from "../../lib/utils";
import studentProfileService from "../../services/StudentProfileService";
import useAuthStore from "../../store/authStore";

/** Linha de ficha: rótulo em micro-label, valor na mesma pauta. */
function Entry({ label, value, hint }) {
  return (
    <div className="border-b border-[color:var(--color-rule)] py-3 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-5">
      <p className="text-muted-foreground ficha-label sm:w-36 sm:shrink-0">
        {label}
      </p>
      <p className="mt-1.5 min-w-0 break-words text-[15px] sm:mt-0 sm:flex-1">
        {value || <span className="text-muted-foreground">—</span>}
        {value && hint ? (
          <span className="text-muted-foreground"> {hint}</span>
        ) : null}
      </p>
    </div>
  );
}

/** Medida como número protagonista. */
function Measure({ label, value, unit, hint }) {
  return (
    <div className="min-w-[8rem]">
      <p className="text-muted-foreground ficha-label">{label}</p>
      <p className="mt-1.5 text-[clamp(1.75rem,3.4vw,2.5rem)] ficha-display">
        {value ?? "—"}
        {value != null && unit ? (
          <span className="ml-1.5 text-[13px] font-medium tracking-[0.1em] ficha-mono">
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground ficha-mono">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionLabel({ children, className }) {
  return (
    <h2 className={cn("text-muted-foreground ficha-label", className)}>
      {children}
    </h2>
  );
}

/**
 * "Meu perfil" no tema "A Ficha": a ficha de cadastro.
 *
 * O nome do aluno é o título da folha — é dele a ficha. Os dados viram linhas
 * de pauta (rótulo em micro-label, valor na pauta) em vez de três cards com
 * ícone, e altura e peso sobem para número protagonista.
 *
 * As avaliações físicas continuam no `AssessmentCard`, compartilhado com a área
 * do personal: ele herda a paleta pelos tokens escopados, sem reescrita.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { logout, loading: loggingOut } = useLogout();

  const canManageWorkouts = useAuthStore(
    (state) => state.user?.student_profile?.can_manage_workouts === true,
  );

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

  const weight = profile?.latest_weight
    ? formatMeasureValue(profile.latest_weight)
    : null;

  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="border-b-2 border-foreground pb-6 pt-8">
        <p className="text-muted-foreground ficha-label">
          Meu perfil · ficha de cadastro
        </p>

        {isLoading ? (
          <span
            aria-hidden="true"
            className="mt-5 block h-16 w-80 max-w-full animate-pulse bg-muted"
          />
        ) : (
          <h1 className="mt-5 break-words text-[clamp(1.875rem,8vw,4.75rem)] ficha-display">
            {profile?.name || "Aluno"}
          </h1>
        )}

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Para alterar qualquer dado deste cadastro, fale com o seu personal.
        </p>
      </div>

      {isError ? (
        <div className="mt-10 border-2 border-border bg-card p-6">
          <ErrorState onRetry={refetch} />
        </div>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap gap-x-14 gap-y-8">
            <Measure
              label="Altura"
              value={profile?.height ?? null}
              unit="m"
            />
            <Measure
              label="Peso atual"
              value={weight}
              unit="kg"
              hint={
                profile?.latest_weight_date
                  ? `Avaliação de ${formatAssessmentDate(profile.latest_weight_date)}`
                  : null
              }
            />
          </div>

          <div className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2">
            <section>
              <SectionLabel className="border-b-2 border-foreground pb-2.5">
                Dados básicos
              </SectionLabel>
              <div className="mt-1">
                <Entry label="Nome" value={profile?.name} />
                <Entry label="CPF" value={profile?.cpf} />
                <Entry label="Sexo" value={profile?.gender} />
                <Entry
                  label="Nascimento"
                  value={formatAssessmentDate(profile?.birth_date)}
                />
              </div>
            </section>

            <section>
              <SectionLabel className="border-b-2 border-foreground pb-2.5">
                Contato
              </SectionLabel>
              <div className="mt-1">
                <Entry label="E-mail" value={profile?.email} />
                <Entry label="Telefone" value={profile?.phone} />
                <Entry label="Personal" value={profile?.trainer?.name} />
              </div>
            </section>
          </div>
        </>
      )}

      <TapeDivider delay={160} className="my-11" />

      <section>
        <SectionLabel>Avaliações físicas</SectionLabel>
        <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] ficha-display">
          As medições
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Cada medida mostra a variação em relação à avaliação anterior.
        </p>

        <div className="mt-8">
          {loadingAssessments ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : assessmentsError ? (
            <div className="border-2 border-border bg-card p-6">
              <ErrorState onRetry={refetchAssessments} />
            </div>
          ) : !assessments?.length ? (
            <>
              <p className="text-[19px] font-medium">
                Nenhuma avaliação registrada ainda
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Seu personal cadastra a primeira quando fizer as medições.
              </p>
            </>
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
      </section>

      <TapeDivider delay={200} className="my-11" tilt={false} />

      {/* No mobile a gaveta deu lugar à barra inferior, então estes dois
          caminhos moram aqui — é a última aba da barra. */}
      <section>
        <SectionLabel>Conta</SectionLabel>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {canManageWorkouts ? (
            <button
              type="button"
              onClick={() => navigate("/student/manage-workouts")}
              className="flex min-h-12 items-center justify-center gap-3 border-2 border-foreground px-6 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ficha-mono hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Gerenciar treinos
            </button>
          ) : null}

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex min-h-12 items-center justify-center gap-3 border-2 border-destructive px-6 text-xs font-semibold uppercase tracking-[0.18em] text-destructive transition-colors duration-200 ficha-mono hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {loggingOut ? "Saindo…" : "Sair da conta"}
          </button>
        </div>
      </section>
    </PageContainer>
  );
}
