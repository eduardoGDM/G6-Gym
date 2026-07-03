import apiClient from "./api/axios";
import { getCsrfToken } from "./csrf";

export const sanctumRequest = async (method, url, data = {}, config = {}) => {
  const csrfToken = await getCsrfToken();

  const response = await apiClient({
    method,
    url,
    data,
    headers: {
      "X-XSRF-TOKEN": csrfToken,
      "Content-Type": "application/json",
    },
    ...config,
    withCredentials: true,
  });

  return response;
};
