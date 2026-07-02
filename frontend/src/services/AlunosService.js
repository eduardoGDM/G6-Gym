import api from "../api/axios";

const alunosService = {
  async getAll() {
    const { data } = await api.get("/trainer/perfil-alunos");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/trainer/perfil-alunos/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/trainer/perfil-alunos", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/trainer/perfil-alunos/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/trainer/perfil-alunos/${id}`);
    return data;
  },
};

export default alunosService;
