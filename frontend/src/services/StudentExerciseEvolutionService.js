import { sanctumRequest } from "../sanctumRequest";

const studentExerciseEvolutionService = {
  async getExercises(studentId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/checkins/exercises`,
    );
    return data;
  },

  async get({ studentId, exerciseId, seriesType, startDate, endDate } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/exercises/${exerciseId}/evolution`,
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

export default studentExerciseEvolutionService;
