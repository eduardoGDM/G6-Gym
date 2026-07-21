import { sanctumRequest } from "../sanctumRequest";

const dailyCheckinsService = {
  async list({ page = 1, perPage = 10, date = "" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/student/daily-checkins",
      {},
      {
        params: {
          page,
          per_page: perPage,
          date: date || undefined,
        },
      },
    );
    return data;
  },

  async create(payload) {
    const { data } = await sanctumRequest(
      "post",
      "/student/daily-checkins",
      payload,
    );
    return data.data;
  },

  async update(id, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/student/daily-checkins/${id}`,
      payload,
    );
    return data.data;
  },

  async reminder() {
    const { data } = await sanctumRequest(
      "get",
      "/student/daily-checkins/reminder",
    );
    return data;
  },
};

export default dailyCheckinsService;
