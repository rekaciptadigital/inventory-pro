import axios from "axios";
import { addAuthorizationHeader, handleTokenRefresh } from "./token";
import { env } from "@/lib/config/env";

// Membuat instance axios dengan konfigurasi dasar
const axiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor untuk menambahkan token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tokens")
      ? JSON.parse(localStorage.getItem("tokens")!).access_token
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
axiosInstance.interceptors.response.use(
  // Mengembalikan response jika tidak ada error
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error bukan 401 atau request sudah di-retry, tolak
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error))
      );
    }

    // Menandai request untuk retry
    originalRequest._retry = true;

    try {
      // Mencoba refresh token
      const token = await handleTokenRefresh(originalRequest);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      // Mengulangi request dengan token baru
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Redirect ke halaman login jika refresh token gagal
      window.location.href = "/login";
      return Promise.reject(
        refreshError instanceof Error
          ? refreshError
          : new Error(String(refreshError))
      );
    }
  }
);

export default axiosInstance;
