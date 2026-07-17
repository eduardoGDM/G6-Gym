import { sanctumRequest } from "../sanctumRequest";

const workoutsService = {
  async getAll() {
    const { data } = await sanctumRequest("get", "/trainer/workouts");
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
