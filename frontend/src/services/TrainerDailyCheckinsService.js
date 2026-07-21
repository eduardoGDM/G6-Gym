import { sanctumRequest } from "../sanctumRequest";

const trainerDailyCheckinsService = {
  async search({ page = 1, perPage = 10, student = "", dateFrom = "", dateTo = "" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/daily-checkins",
      {},
      {
        params: {
          page,
          per_page: perPage,
          student: student || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      },
    );
    return data;
  },

  async getById(id) {
    const { data } = await sanctumRequest("get", `/trainer/daily-checkins/${id}`);
    return data.data;
  },
};

export default trainerDailyCheckinsService;
