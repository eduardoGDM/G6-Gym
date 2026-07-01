import api from "../api/axios";

const exerciciosService = {
  async getAll() {
    const { data } = await api.get("/personal/exercicios");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/personal/exercicios/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/personal/exercicios", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/personal/exercicios/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/personal/exercicios/${id}`);
    return data;
  },
};

export default exerciciosService;
