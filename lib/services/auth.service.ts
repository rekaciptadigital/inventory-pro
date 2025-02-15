import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/config/constants';
import type { AuthResponse, LoginCredentials, VerifyTokenResponse } from '@/lib/types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, 
      JSON.stringify(credentials),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await axios.get<VerifyTokenResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.VERIFY}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }

  async logout(token?: string): Promise<void> {
    if (!token) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();