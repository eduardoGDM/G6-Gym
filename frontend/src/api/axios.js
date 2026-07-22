import axios from "axios";
import toast from "react-hot-toast";

import { API_BASE_URL, REQUEST_TIMEOUT } from "../config/api";
import useAuthStore from "../store/authStore";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Encerra a sessão no client quando o backend indica que ela não é mais válida:
 * - 401: sessão expirada / não autenticada.
 * - 403 com code "ACCOUNT_INACTIVE": conta desativada (admin) ou aluno removido.
 *
 * Ao limpar o usuário do store, os guards de rota em AppRoutes redirecionam
 * automaticamente para a tela de login — sem reload forçado. O early-return em
 * `user` já vazio deduplica quando várias requisições falham ao mesmo tempo.
 */
function endSession(accountInactive) {
  const { user, logout } = useAuthStore.getState();
  if (!user) return;

  logout();

  toast.error(
    accountInactive
      ? "Sua conta foi desativada. Entre em contato com o administrador da plataforma."
      : "Sua sessão expirou. Faça login novamente.",
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const url = error?.config?.url ?? "";

    // Os endpoints de auth (login, probe de sessão, logout) tratam o próprio
    // erro — não devem disparar o encerramento global de sessão.
    const isAuthEndpoint = url.includes("/auth/");

    const sessionExpired = status === 401;
    const accountInactive = status === 403 && code === "ACCOUNT_INACTIVE";

    if (!isAuthEndpoint && (sessionExpired || accountInactive)) {
      endSession(accountInactive);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
