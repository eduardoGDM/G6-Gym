import axios from "axios";

import { CSRF_COOKIE_URL } from "./config/api";

export async function getCsrfToken() {
  try {
    // 1. Requisita o cookie CSRF
    await axios.get(CSRF_COOKIE_URL, {
      withCredentials: true,
    });

    // 2. Extrai o token do cookie
    const xsrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!xsrfToken) {
      if (import.meta.env.DEV) {
        console.error("XSRF-TOKEN não encontrado nos cookies");
      }
      return null;
    }

    return decodeURIComponent(xsrfToken);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao buscar token CSRF:", error);
    }
    return null;
  }
}
