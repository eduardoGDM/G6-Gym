import api from "../api/axios";

const studentsService = {
  async getAll() {
    const { data } = await api.get("/trainer/student-profiles");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/trainer/student-profiles/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/trainer/student-profiles", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/trainer/student-profiles/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/trainer/student-profiles/${id}`);
    return data;
  },
};

export default studentsService;
