import { sanctumRequest } from "../sanctumRequest";

const workoutCheckinsService = {
  async history({ page = 1, perPage = 10, search = "" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/student/checkins",
      {},
      {
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
        },
      },
    );
    return data;
  },

  async getByDate(date) {
    try {
      const { data } = await sanctumRequest(
        "get",
        "/student/checkins/by-date",
        {},
        { params: { date } },
      );
      return data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getById(id) {
    const { data } = await sanctumRequest("get", `/student/checkins/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await sanctumRequest("post", "/student/checkins", payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/student/checkins/${id}`,
      payload,
    );
    return data.data;
  },
};

export default workoutCheckinsService;
