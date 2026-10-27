import PageContainer from "../../components/common/PageContainer";
import TapeDivider from "../../components/ficha/TapeDivider";
import ExerciseEvolutionPanel from "../../components/evolution/ExerciseEvolutionPanel";
import studentSelfExerciseEvolutionService from "../../services/StudentSelfExerciseEvolutionService";

/**
 * Tela "Evolução" do painel do aluno: mesma UI de evolução de exercícios usada
 * pelo trainer (autocomplete + gráfico + cards), porém com os dados do próprio
 * aluno autenticado.
 *
 * O painel é compartilhado com a área do treinador, então não foi reescrito no
 * tema "A Ficha" — ele herda a paleta pelos tokens escopados (`index.css`), e
 * só o cabeçalho desta página é próprio.
 */
export default function Evolution() {
  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="border-b-2 border-foreground pb-6 pt-8">
        <p className="text-muted-foreground ficha-label">
          Evolução · carga e repetições
        </p>
        <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)] ficha-display">
          A régua
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Escolha um exercício para ver como a carga e as repetições se moveram
          ao longo dos seus check-ins.
        </p>
      </div>

      <TapeDivider delay={120} className="mb-9 mt-9" />

      <ExerciseEvolutionPanel
        queryKey={["student-self-evolution"]}
        fetchExercises={() => studentSelfExerciseEvolutionService.getExercises()}
        fetchEvolution={({ exerciseId, seriesType, startDate, endDate }) =>
          studentSelfExerciseEvolutionService.get({
            exerciseId,
            seriesType,
            startDate,
            endDate,
          })
        }
        description="Evolução de carga e repetições com base nos seus check-ins."
        emptyHistoryMessage="Você ainda não possui histórico de treinos suficiente para gerar gráficos de evolução. Registre seus check-ins para acompanhar sua evolução."
      />
    </PageContainer>
  );
}
