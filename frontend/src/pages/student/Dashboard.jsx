import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import TallyMarks from "../../components/ficha/TallyMarks";
import TapeDivider from "../../components/ficha/TapeDivider";
import { usePendingWorkout } from "../../hooks/usePendingWorkout";
import { cn } from "../../lib/utils";
import { formatDate } from "../../lib/format";
import gamificationService from "../../services/GamificationService";
import studentDashboardService from "../../services/StudentDashboardService";
import useAuthStore from "../../store/authStore";
import { getGreeting } from "../../utils/greeting";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const WEEKDAY_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const parseLocalDate = (value) => new Date(`${value}T00:00:00`);

const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const formatNumber = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString("pt-BR");

/** Barra pulsando no lugar de um número ainda não carregado. */
function Loading({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mt-1 block h-8 w-28 animate-pulse bg-muted", className)}
    />
  );
}

/**
 * Dado de apoio como linha tipográfica — não como card de métrica. O label é
 * micro-mono em caixa alta; o valor é o número grande da display.
 */
function Stat({ label, value, unit, loading, delay = 0, divider = true }) {
  return (
    <div
      className={cn(
        "animate-rise",
        divider && "mt-5 border-t border-border pt-4",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-muted-foreground ficha-label">{label}</p>
      {loading ? (
        <Loading />
      ) : (
        <p className="mt-1 text-[clamp(1.75rem,3.4vw,2.75rem)] ficha-display">
          {value}
          {unit ? (
            <span className="ml-1.5 text-[13px] font-medium tracking-[0.1em] ficha-mono">
              {unit}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}

/**
 * A semana em fita de demarcação de piso: preenchida onde treinou, vazada onde
 * não, anilha no dia de hoje.
 */
function WeekStrip({ days, loading }) {
  if (loading) {
    return (
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-[46px] flex-1 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (!days.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem registros nesta semana ainda.
      </p>
    );
  }

  const today = todayISO();

  return (
    <div className="flex gap-1.5">
      {days.map((day, index) => {
        const isToday = day.date === today;

        return (
          <div key={day.date} className="min-w-0 flex-1">
            <div
              title={day.trained ? "Treino registrado" : "Sem treino"}
              className={cn(
                "h-[46px] origin-left animate-unroll",
                day.trained
                  ? isToday
                    ? "bg-primary"
                    : "bg-foreground"
                  : isToday
                    ? "border-2 border-primary border-dashed"
                    : "border-[1.5px] border-dashed border-input",
              )}
              style={{ animationDelay: `${640 + index * 40}ms` }}
            />
            <p
              className={cn(
                "mt-1.5 text-center text-[10px] tracking-[0.1em] ficha-mono",
                isToday ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {WEEKDAY_SHORT[parseLocalDate(day.date).getDay()]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Painel inicial do aluno no tema "A Ficha".
 *
 * Quebra deliberada do dashboard manjado (4 cards de métrica + gráfico de anel
 * + tabela): grid assimétrico, número gigante sangrando a margem, sequência em
 * pauzinhos, semana em fita de piso e os últimos treinos em pauta de caderno.
 *
 * Nenhuma fonte de dados nova: as mesmas quatro queries de antes, mais o
 * treino pendente — que já é buscado pelo StudentLayout e vem do cache.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const now = new Date();

  const { data: summary } = useQuery({
    queryKey: ["student-dashboard-summary"],
    queryFn: studentDashboardService.summary,
  });

  const { data: recentWorkouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["student-dashboard-recent-workouts"],
    queryFn: studentDashboardService.recentWorkouts,
  });

  const { data: evolution, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ["student-dashboard-evolution"],
    queryFn: studentDashboardService.evolution,
  });

  const { data: gamification, isLoading: isLoadingGamification } = useQuery({
    queryKey: ["student-gamification-summary"],
    queryFn: gamificationService.summary,
  });

  const { data: pending } = usePendingWorkout();

  const week = gamification?.week || [];
  const trainedThisWeek = week.filter((day) => day.trained).length;
  const streak = gamification?.streak?.current ?? 0;
  const longestStreak = gamification?.streak?.longest ?? 0;
  const activeWorkouts = summary?.active_workouts ?? 0;
  const sessions = recentWorkouts || [];

  // Treino em andamento manda na tela. Sem pendência, o herói é o convite para
  // escolher o treino do dia.
  const heroTitle = pending?.workout?.name || "Treino de hoje";
  const heroAction = pending
    ? {
        label: `Retomar ${pending.workout?.name || "treino"}`,
        to: `/student/workout/${pending.workout_id}?checkin_id=${pending.id}`,
      }
    : {
        label: "Escolher treino de hoje",
        to: "/student/my-workouts",
      };

  const watermark = pending
    ? (pending.exercises_count ?? activeWorkouts)
    : activeWorkouts;

  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3 border-b-2 border-foreground pb-6 pt-8">
        <p className="flex-grow text-muted-foreground ficha-label">
          {WEEKDAYS[now.getDay()]} ·{" "}
          {String(now.getDate()).padStart(2, "0")}.
          {String(now.getMonth() + 1).padStart(2, "0")} · {getGreeting()},{" "}
          {user?.name?.split(" ")[0] || "aluno"}
        </p>
        {summary?.last_workout_checkin ? (
          <p className="text-muted-foreground ficha-label">
            Último treino · {formatDate(summary.last_workout_checkin)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-12 gap-y-12 pt-8 sm:gap-y-16 sm:pt-12">
        {/* ── Coluna principal ─────────────────────────────────────── */}
        <section className="relative min-w-0 flex-[999_1_560px]">
          {/* Só a partir do desktop: a sangria de -6% na margem viraria
              rolagem horizontal no mobile, e atrás de um título de 30px o
              número gigante deixa de ser marca d'água e passa a ser ruído. */}
          {watermark > 0 ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[6%] top-10 hidden select-none text-[clamp(11rem,24vw,20rem)] leading-none text-foreground/[0.07] ficha-display lg:block"
            >
              {watermark}
            </span>
          ) : null}

          <div className="relative">
            <h1 className="break-words text-[clamp(2.125rem,9vw,7.25rem)] ficha-display">
              {heroTitle}
            </h1>

            <p
              className="mt-5 animate-rise text-[13px] uppercase tracking-[0.16em] ficha-mono"
              style={{ animationDelay: "160ms" }}
            >
              {pending ? (
                <>
                  Em andamento
                  <span className="text-muted-foreground">
                    {" "}
                    — retome de onde parou
                  </span>
                </>
              ) : (
                <>
                  {activeWorkouts}{" "}
                  {activeWorkouts === 1 ? "treino ativo" : "treinos ativos"}
                  <span className="text-muted-foreground">
                    {" "}
                    na sua ficha
                  </span>
                </>
              )}
            </p>

            {!isLoadingGamification ? (
              <p
                className="mt-9 max-w-[540px] animate-rise text-[19px] leading-[1.5]"
                style={{ animationDelay: "240ms" }}
              >
                <span className="mx-1.5 align-[-0.18em] text-[3.25rem] text-primary ficha-display sm:text-[4.5rem]">
                  {trainedThisWeek}
                </span>
                {trainedThisWeek === 1 ? "dia treinado" : "dias treinados"} nesta
                semana.
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => navigate(heroAction.to)}
              className="mt-8 flex min-h-16 w-full max-w-[470px] animate-rise items-center justify-between gap-6 border-2 border-foreground bg-primary px-6 py-5 text-primary-foreground transition-colors duration-200 ficha-wipe hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ animationDelay: "320ms" }}
            >
              <span className="text-left text-sm font-semibold uppercase tracking-[0.2em] ficha-mono">
                {heroAction.label}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
          </div>

          {/* ── Últimos treinos, em pauta de caderno ───────────────── */}
          <div className="mt-16">
            <h2 className="mb-1 text-muted-foreground ficha-label">
              O caderno · últimos treinos
            </h2>

            {isLoadingWorkouts ? (
              <div aria-hidden="true" className="border-t border-border">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex h-16 items-center border-b border-border"
                  >
                    <span className="h-4 w-48 animate-pulse bg-muted" />
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                Assim que você concluir um treino, ele aparece aqui.
              </p>
            ) : (
              <ul className="border-t border-border">
                {sessions.map((row, index) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/student/history/${row.id}`)}
                      className="flex h-16 w-full animate-rise items-end gap-3 border-b border-border pb-[9px] pr-1 text-left transition-colors duration-200 ficha-ruled hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:pr-2.5"
                      style={{ animationDelay: `${380 + index * 40}ms` }}
                    >
                      <span className="w-12 shrink-0 text-xs text-muted-foreground ficha-mono">
                        {formatDate(row.date, "—").slice(0, 5)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[17px] font-medium">
                        {row.workout_name || "Treino removido"}
                      </span>
                      {/* Em 360px as colunas fixas engoliam o nome do treino:
                          a unidade só aparece quando há largura para ela. */}
                      <span className="w-10 shrink-0 text-right text-[26px] ficha-display sm:w-24">
                        {row.exercises_count ?? 0}
                      </span>
                      <span className="hidden w-14 shrink-0 text-xs text-muted-foreground ficha-mono sm:block">
                        exerc.
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => navigate("/student/history")}
              className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ficha-mono hover:text-primary"
            >
              Ver histórico completo
            </button>
          </div>
        </section>

        {/* ── Coluna de apoio, deslocada ───────────────────────────── */}
        <aside className="min-w-0 flex-[1_1_320px] lg:pt-12">
          <section>
            <h2 className="mb-5 text-muted-foreground ficha-label">Sequência</h2>

            {isLoadingGamification ? (
              <Loading className="h-20 w-40" />
            ) : (
              <>
                <div className="flex items-end gap-4">
                  <span className="text-[76px] ficha-display sm:text-[104px]">
                    {streak}
                  </span>
                  <span className="pb-3.5 text-muted-foreground ficha-label">
                    {streak === 1 ? "dia" : "dias"}
                    <br />
                    {streak === 1 ? "seguido" : "seguidos"}
                  </span>
                </div>

                {streak > 0 ? (
                  <TallyMarks
                    count={streak}
                    label={`${streak} ${streak === 1 ? "dia" : "dias"} de treino em sequência`}
                    delay={320}
                    className="mt-5 max-w-full"
                  />
                ) : (
                  <p className="mt-3 max-w-[260px] text-sm text-muted-foreground">
                    Nenhuma sequência ativa. O primeiro traço é hoje.
                  </p>
                )}

                {longestStreak > 0 ? (
                  <p className="mt-4 text-muted-foreground ficha-label">
                    Seu recorde · {longestStreak}{" "}
                    {longestStreak === 1 ? "dia" : "dias"}
                  </p>
                ) : null}
              </>
            )}
          </section>

          <TapeDivider delay={560} className="my-10" />

          <section>
            <h2 className="mb-4 text-muted-foreground ficha-label">
              Esta semana · {trainedThisWeek} de 7
            </h2>
            <WeekStrip days={week} loading={isLoadingGamification} />
          </section>

          <div className="mt-11 border-t-2 border-foreground pt-5">
            <Stat
              label="Maior carga registrada"
              value={
                evolution?.max_weight != null
                  ? formatNumber(evolution.max_weight)
                  : "—"
              }
              unit={evolution?.max_weight != null ? "kg" : undefined}
              loading={isLoadingEvolution}
              delay={380}
              divider={false}
            />
            <Stat
              label="Check-ins registrados"
              value={formatNumber(evolution?.total_checkins ?? 0)}
              loading={isLoadingEvolution}
              delay={420}
            />
            <Stat
              label="Séries · exercícios feitos"
              value={formatNumber(evolution?.total_exercises_performed ?? 0)}
              loading={isLoadingEvolution}
              delay={460}
            />

            {evolution?.top_exercise ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-muted-foreground ficha-label">
                  Exercício mais executado
                </p>
                <p className="mt-1.5 text-[17px] font-medium">
                  {evolution.top_exercise}
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <footer className="mt-20 border-t border-border pt-7">
        <p className="max-w-[620px] text-[21px] leading-[1.5] ficha-hand">
          Constância vale mais que intensidade. Apareça, registre, repita.
        </p>
      </footer>
    </PageContainer>
  );
}
