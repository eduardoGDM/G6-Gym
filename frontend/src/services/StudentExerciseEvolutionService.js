import { sanctumRequest } from "../sanctumRequest";

const studentExerciseEvolutionService = {
  async getMuscleGroups(studentId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/checkins/muscle-groups`,
    );
    return data;
  },

  async getExercises(studentId, muscleGroupId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/checkins/exercises`,
      {},
      { params: { muscle_group_id: muscleGroupId } },
    );
    return data;
  },

  async get({ studentId, exerciseId, muscleGroupId, startDate, endDate } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/exercises/${exerciseId}/evolution`,
      {},
      {
        params: {
          muscle_group_id: muscleGroupId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      },
    );
    return data;
  },
};

export default studentExerciseEvolutionService;
