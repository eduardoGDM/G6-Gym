import { sanctumRequest } from "../sanctumRequest";

const studentsService = {
  async getAll() {
    const { data } = await sanctumRequest("get", "/trainer/student-profiles");
    return data;
  },

  async getById(id) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/student-profiles/${id}`,
    );
    return data;
  },

  async create(payload) {
    const { data } = await sanctumRequest(
      "post",
      "/trainer/student-profiles",
      payload,
    );
    return data;
  },

  async update(id, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/trainer/student-profiles/${id}`,
      payload,
    );
    return data;
  },

  async remove(id) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/student-profiles/${id}`,
    );
    return data;
  },
};

export default studentsService;
