import api from "../api/axios";

const exercisesService = {
  async getAll() {
    const { data } = await api.get("/trainer/exercises");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/trainer/exercises/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/trainer/exercises", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/trainer/exercises/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/trainer/exercises/${id}`);
    return data;
  },
};

export default exercisesService;
