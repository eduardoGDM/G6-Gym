import axios from "axios";

import { API_BASE_URL, REQUEST_TIMEOUT } from "../config/api";

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

export default apiClient;
