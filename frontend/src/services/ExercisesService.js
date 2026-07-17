import { sanctumRequest } from "../sanctumRequest";

const exercisesService = {
  async getAll() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/exercises",
      {},
      { params: { per_page: 1000 } },
    );
    return data.data;
  },

  async search({ page = 1, perPage = 10, search = "", muscleGroups = [] } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/exercises",
      {},
      {
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
          muscle_groups: muscleGroups.length ? muscleGroups : undefined,
        },
      },
    );
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
