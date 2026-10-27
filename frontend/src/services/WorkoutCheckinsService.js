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

  /**
   * Treino iniciado e não finalizado (hoje ou ontem), usado no destaque de
   * "Meus treinos" e na modal de retomada. Retorna null quando não há pendência.
   */
  async pending() {
    const { data } = await sanctumRequest(
      "get",
      "/student/checkins/pending",
      {},
    );
    // Resource aninhado na resposta não recebe o envelope `data`.
    return data.pending ? data.checkin : null;
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

  async remove(id) {
    const { data } = await sanctumRequest(
      "delete",
      `/student/checkins/${id}`,
    );
    return data;
  },
};

export default workoutCheckinsService;
