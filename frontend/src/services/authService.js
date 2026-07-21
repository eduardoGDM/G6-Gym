import { sanctumRequest } from "../sanctumRequest";

const authService = {
  async me() {
    const { data } = await sanctumRequest("get", "/auth/user");
    return data;
  },

  // TODO - resolver pendencia de 401 quando nao esta autenticado, ( chamada desnecessaria )
  async initAuth() {
    try {
      return await this.me();
    } catch {
      return null;
    }
  },

  async login(credentials) {
    const { data } = await sanctumRequest("post", "/auth/login", credentials);
    return data;
  },

  async logout() {
    const { data } = await sanctumRequest("post", "/auth/logout");
    return data;
  },
};

export default authService;
