import apiClient from "./api/axios";
import { getCsrfToken } from "./csrf";

// Métodos de leitura não passam pela verificação CSRF do Laravel, então não
// precisam do token nem do cookie — evitamos a requisição extra a
// /sanctum/csrf-cookie em toda chamada de leitura.
const SAFE_METHODS = new Set(["get", "head", "options"]);

export const sanctumRequest = async (method, url, data = {}, config = {}) => {
  const isSafeMethod = SAFE_METHODS.has(String(method).toLowerCase());
  const csrfToken = isSafeMethod ? null : await getCsrfToken();
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const response = await apiClient({
    method,
    url,
    data,
    ...config,
    headers: {
      // Só envia o header de CSRF em requisições que alteram estado.
      ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
      // apiClient define Content-Type: application/json por padrão; para FormData
      // isso precisa ser explicitamente removido (não apenas omitido), senão o axios
      // serializa o FormData como JSON e o arquivo se perde antes do envio.
      "Content-Type": isFormData ? undefined : "application/json",
      ...config.headers,
    },
    withCredentials: true,
  });

  return response;
};
