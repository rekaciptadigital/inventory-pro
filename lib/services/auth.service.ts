import axios from 'axios';
import type { AuthResponse, LoginCredentials } from '@/lib/types/auth';

const API_URL = 'https://api.proarchery.id';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getTokens() {
    const tokensStr = localStorage.getItem('tokens');
    if (tokensStr) {
      return JSON.parse(tokensStr);
    }
    return null;
  },
};