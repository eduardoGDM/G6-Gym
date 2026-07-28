import { sanctumRequest } from "../sanctumRequest";

/**
 * Evolução de exercícios do próprio aluno autenticado (tela "Evolução" do painel
 * do aluno). Consome os endpoints escopados ao aluno logado — sem receber um id
 * de aluno, ao contrário do serviço usado pelo trainer.
 */
const studentSelfExerciseEvolutionService = {
  async getExercises() {
    const { data } = await sanctumRequest("get", "/student/evolution/exercises");
    return data;
  },

  async get({ exerciseId, seriesType, startDate, endDate } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/student/evolution/exercises/${exerciseId}`,
      {},
      {
        params: {
          series_type: seriesType || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      },
    );
    return data;
  },
};

export default studentSelfExerciseEvolutionService;
