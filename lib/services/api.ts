import axios from "axios";
import { env } from "@/lib/config/env";
import { STORAGE_KEYS } from "@/lib/config/constants";

const createApiClient = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is required");
  }

  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (tokensStr) {
        const { access_token } = JSON.parse(tokensStr);
        config.headers.Authorization = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKENS);
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const api = createApiClient();
