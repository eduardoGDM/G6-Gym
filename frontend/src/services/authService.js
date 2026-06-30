import api from "../api/axios";

const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    return data;
  },

  async me() {
    const { data } = await api.get("/auth/me");

    return data;
  },

  async logout() {
    const { data } = await api.post("/auth/logout");

    return data;
  },
};

export default authService;
