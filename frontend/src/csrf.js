import axios from "axios";

import { CSRF_COOKIE_URL } from "./config/api";

// Lê o token XSRF já presente nos cookies (setado pelo Sanctum). Não faz rede.
function readTokenFromCookie() {
  const xsrfToken = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  return xsrfToken ? decodeURIComponent(xsrfToken) : null;
}

// Evita disparar várias requisições simultâneas a /sanctum/csrf-cookie quando
// vários requests concorrentes precisam do token ao mesmo tempo.
let inFlightRequest = null;

/**
 * Garante um token CSRF válido.
 *
 * O cookie XSRF-TOKEN emitido pelo Sanctum persiste no navegador, então na
 * imensa maioria das chamadas ele já está disponível e nenhuma requisição de
 * rede é necessária. Só batemos em /sanctum/csrf-cookie quando o cookie ainda
 * não existe (primeira mutação da sessão), eliminando o round-trip extra que
 * antes acontecia em TODAS as requisições.
 */
export async function getCsrfToken() {
  const existing = readTokenFromCookie();
  if (existing) {
    return existing;
  }

  try {
    if (!inFlightRequest) {
      inFlightRequest = axios.get(CSRF_COOKIE_URL, { withCredentials: true });
    }
    await inFlightRequest;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao buscar token CSRF:", error);
    }
    return null;
  } finally {
    inFlightRequest = null;
  }

  const token = readTokenFromCookie();
  if (!token && import.meta.env.DEV) {
    console.error("XSRF-TOKEN não encontrado nos cookies");
  }

  return token;
}
