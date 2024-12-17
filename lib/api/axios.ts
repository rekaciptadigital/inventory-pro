import axios from 'axios';
import { addAuthorizationHeader, handleTokenRefresh } from './token';
import { env } from '@/lib/config/env';

const axiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => addAuthorizationHeader(config),
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await handleTokenRefresh(originalRequest);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Redirect to login on refresh token failure
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;