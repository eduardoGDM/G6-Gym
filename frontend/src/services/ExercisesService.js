import { sanctumRequest } from "../sanctumRequest";

const exercisesService = {
  async getAll() {
    const { data } = await sanctumRequest("get", "/trainer/exercises");
    return data;
  },

  async getById(id) {
    const { data } = await sanctumRequest("get", `/trainer/exercises/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await sanctumRequest(
      "post",
      "/trainer/exercises",
      payload,
    );
    return data;
  },

  async update(id, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/trainer/exercises/${id}`,
      payload,
    );
    return data;
  },

  async remove(id) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/exercises/${id}`,
    );
    return data;
  },
};

export default exercisesService;
