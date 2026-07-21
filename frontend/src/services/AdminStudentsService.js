import { sanctumRequest } from "../sanctumRequest";

const adminStudentsService = {
  async search({ page = 1, perPage = 10, name = "", email = "", trainer = "" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/admin/students",
      {},
      {
        params: {
          page,
          per_page: perPage,
          name: name || undefined,
          email: email || undefined,
          trainer: trainer || undefined,
        },
      },
    );
    return data;
  },

  async updateStatus(id, isActive) {
    const { data } = await sanctumRequest(
      "patch",
      `/admin/students/${id}/status`,
      { is_active: isActive },
    );
    return data;
  },
};

export default adminStudentsService;
