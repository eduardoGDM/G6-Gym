import { sanctumRequest } from "../sanctumRequest";

const workoutsService = {
  async search({ page = 1, perPage = 10, studentSearch = "", status = "all" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/workouts",
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

  async getById(id) {
    const { data } = await sanctumRequest("get", `/trainer/workouts/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await sanctumRequest(
      "post",
      "/trainer/workouts",
      payload,
    );
    return data;
  },

  async update(id, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/trainer/workouts/${id}`,
      payload,
    );
    return data;
  },

  async remove(id) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/workouts/${id}`,
    );
    return data;
  },

  async getMyWorkouts() {
    const { data } = await sanctumRequest("get", "/student/my-workouts");
    return data;
  },

  async getWorkout(id) {
    const { data } = await sanctumRequest("get", `/student/workout/${id}`);
    return data;
  },
};

export default workoutsService;
