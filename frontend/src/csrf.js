import axios from "axios";

export async function getCsrfToken() {
  try {
    // 1. Requisita o cookie CSRF
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });

    // 2. Extrai o token do cookie
    const xsrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!xsrfToken) {
      console.error("XSRF-TOKEN não encontrado nos cookies");
      return null;
    }

    return decodeURIComponent(xsrfToken);
  } catch (error) {
    console.error("Erro ao buscar token CSRF:", error);
    return null;
  }
}
