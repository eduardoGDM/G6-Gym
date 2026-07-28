import ExerciseEvolutionPanel from "../../../../components/evolution/ExerciseEvolutionPanel";
import studentExerciseEvolutionService from "../../../../services/StudentExerciseEvolutionService";

/**
 * Evolução de exercícios do aluno vista pelo trainer (dentro do perfil do
 * aluno). Reutiliza o painel compartilhado, injetando os endpoints do trainer
 * escopados ao aluno selecionado.
 */
export default function ExerciseEvolutionSection({ studentId }) {
  return (
    <div className="mt-6">
      <ExerciseEvolutionPanel
        queryKey={["trainer-student-evolution", studentId]}
        enabled={Boolean(studentId)}
        fetchExercises={() => studentExerciseEvolutionService.getExercises(studentId)}
        fetchEvolution={({ exerciseId, seriesType, startDate, endDate }) =>
          studentExerciseEvolutionService.get({
            studentId,
            exerciseId,
            seriesType,
            startDate,
            endDate,
          })
        }
        description="Evolução de carga e repetições com base no histórico de check-ins do aluno."
        emptyHistoryMessage="Este aluno ainda não possui histórico de treinos suficiente para gerar gráficos de evolução."
      />
    </div>
  );
}
