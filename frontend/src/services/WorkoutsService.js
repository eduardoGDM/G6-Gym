import { sanctumRequest } from "../sanctumRequest";

// Personal gerencia os treinos de todos os alunos; o aluno autorizado usa
// endpoints próprios, restritos aos treinos dele (ver useWorkoutScope).
const WORKOUTS_ENDPOINT = {
  trainer: "/trainer/workouts",
  student: "/student/managed-workouts",
};

const workoutsService = {
  async search({
    page = 1,
    perPage = 10,
    studentSearch = "",
    status = "all",
    scope = "trainer",
  } = {}) {
    const { data } = await sanctumRequest(
      "get",
      WORKOUTS_ENDPOINT[scope],
      {},
      {
        params: {
          page,
          per_page: perPage,
          student_search: studentSearch || undefined,
          status: status && status !== "all" ? status : undefined,
        },
      },
    );
    return data;
  },

  async getById(id, scope = "trainer") {
    const { data } = await sanctumRequest(
      "get",
      `${WORKOUTS_ENDPOINT[scope]}/${id}`,
    );
    return data;
  },

  async create(payload, scope = "trainer") {
    const { data } = await sanctumRequest(
      "post",
      WORKOUTS_ENDPOINT[scope],
      payload,
    );
    return data;
  },

  async update(id, payload, scope = "trainer") {
    const { data } = await sanctumRequest(
      "put",
      `${WORKOUTS_ENDPOINT[scope]}/${id}`,
      payload,
    );
    return data;
  },

  async remove(id, scope = "trainer") {
    const { data } = await sanctumRequest(
      "delete",
      `${WORKOUTS_ENDPOINT[scope]}/${id}`,
    );
    return data;
  },

  async generateMyWorkoutSheet() {
    const response = await sanctumRequest(
      "get",
      `${WORKOUTS_ENDPOINT.student}/sheet`,
      {},
      { responseType: "blob" },
    );
    return response.data;
  },

  async getMyWorkouts() {
    const { data } = await sanctumRequest("get", "/student/my-workouts");
    return data;
  },

  async getWorkout(id) {
    const { data } = await sanctumRequest("get", `/student/workout/${id}`);
    return data;
  },

  /**
   * Troca os exercícios de um treino atribuído ao aluno mantendo a estrutura
   * prescrita (séries, repetições, carga, descanso). `exercises` é uma lista de
   * { workout_exercise_id, exercise_id }.
   */
  async updateWorkoutExercises(id, exercises) {
    const { data } = await sanctumRequest(
      "put",
      `/student/workout/${id}/exercises`,
      { exercises },
    );
    return data;
  },
};

export default workoutsService;
