import { sanctumRequest } from "../sanctumRequest";

const authService = {
  async me() {
    const { data } = await sanctumRequest("get", "/auth/user");
    return data;
  },

  async initAuth() {
    try {
      const user = await this.me();

      // /auth/user não passa pelo middleware de papel, então ainda responde
      // para uma conta desativada. No client, tratamos como não autenticado.
      if (user && user.is_active === false) {
        return null;
      }

      return user;
    } catch {
      // 401 quando não há sessão é esperado no primeiro carregamento; o
      // interceptor global ignora o endpoint /auth/ e o fluxo segue no login.
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
