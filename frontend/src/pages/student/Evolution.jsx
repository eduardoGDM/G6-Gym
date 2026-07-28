import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import ExerciseEvolutionPanel from "../../components/evolution/ExerciseEvolutionPanel";
import studentSelfExerciseEvolutionService from "../../services/StudentSelfExerciseEvolutionService";

/**
 * Tela "Evolução" do painel do aluno: mesma UI de evolução de exercícios usada
 * pelo trainer (autocomplete + gráfico + cards), porém com os dados do próprio
 * aluno autenticado.
 */
export default function Evolution() {
  return (
    <PageContainer>
      <PageTitle
        title="Evolução"
        description="Acompanhe a evolução de carga e repetições dos seus exercícios."
      />

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
