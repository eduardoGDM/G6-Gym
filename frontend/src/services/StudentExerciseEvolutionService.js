import { sanctumRequest } from "../sanctumRequest";

const studentExerciseEvolutionService = {
  async getExercises(studentId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/checkins/exercises`,
    );
    return data;
  },

  async get({ studentId, exerciseId, startDate, endDate } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/exercises/${exerciseId}/evolution`,
      {},
      {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      },
    );
    return data;
  },
};

export default studentExerciseEvolutionService;
