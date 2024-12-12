import { api } from './api';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/lib/config/constants';
import type { AuthResponse, LoginCredentials } from '@/lib/types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getTokens() {
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (tokensStr) {
      return JSON.parse(tokensStr);
    }
    return null;
  }
}

export const authService = new AuthService();