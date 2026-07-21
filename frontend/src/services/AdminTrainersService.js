import { sanctumRequest } from "../sanctumRequest";

const adminTrainersService = {
  async search({ page = 1, perPage = 10, name = "", email = "" } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/admin/trainers",
      {},
      {
        params: {
          page,
          per_page: perPage,
          name: name || undefined,
          email: email || undefined,
        },
      },
    );
    return data;
  },

  async updateStatus(id, isActive) {
    const { data } = await sanctumRequest(
      "patch",
      `/admin/trainers/${id}/status`,
      { is_active: isActive },
    );
    return data;
  },
};

export default adminTrainersService;
