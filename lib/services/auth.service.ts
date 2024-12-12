import { API_ENDPOINTS } from '@/lib/config/constants';
import type { AuthResponse, LoginCredentials } from '@/lib/types/auth';
import { api } from './api';
import { logoutUser } from './auth/logout.service';
import { getCurrentUser, getTokens, clearAuthData } from './auth/storage.service';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  }

  async logout(token?: string): Promise<void> {
    try {
      await logoutUser(token);
    } finally {
      clearAuthData();
    }
  }

  getCurrentUser = getCurrentUser;
  getTokens = getTokens;
  clearAuth = clearAuthData;
}

export const authService = new AuthService();