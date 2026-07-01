import api from "../api/axios";

const alunosService = {
  async getAll() {
    const { data } = await api.get("/personal/perfil-alunos");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/personal/perfil-alunos/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/personal/perfil-alunos", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/personal/perfil-alunos/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/personal/perfil-alunos/${id}`);
    return data;
  },
};

export default alunosService;
