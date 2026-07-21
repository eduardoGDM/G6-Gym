import apiClient from "./api/axios";
import { getCsrfToken } from "./csrf";

export const sanctumRequest = async (method, url, data = {}, config = {}) => {
  const csrfToken = await getCsrfToken();
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const response = await apiClient({
    method,
    url,
    data,
    ...config,
    headers: {
      "X-XSRF-TOKEN": csrfToken,
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
