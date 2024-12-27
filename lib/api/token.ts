import axios from 'axios';
import { STORAGE_KEYS } from '@/lib/config/constants';
import type { AuthTokens } from '@/types/auth';

// Antrian untuk menyimpan permintaan yang tertunda selama penyegaran token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Fungsi untuk mendapatkan access token dari localStorage
export function getAccessToken(): string | null {
  try {
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!tokensStr) return null;
    const tokens: AuthTokens = JSON.parse(tokensStr);
    return tokens.access_token;
  } catch {
    return null;
  }
}

// Fungsi untuk mendapatkan refresh token dari localStorage
export function getRefreshToken(): string | null {
  try {
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!tokensStr) return null;
    const tokens: AuthTokens = JSON.parse(tokensStr);
    return tokens.refresh_token;
  } catch {
    return null;
  }
}

// Fungsi untuk menyegarkan access token menggunakan refresh token
export async function refreshAccessToken(): Promise<string> {
  try {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('/auth/refresh-token', {
      refresh_token,
    });

    const { tokens } = response.data;
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    return tokens.access_token;
  } catch (error) {
    // Menghapus data auth jika penyegaran token gagal
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    throw error;
  }
}

// Memproses antrian yang gagal setelah penyegaran token
function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
}

// Fungsi untuk menambahkan header otorisasi ke konfigurasi permintaan
export function addAuthorizationHeader(config: any): any {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

// Menangani penyegaran token untuk permintaan yang gagal
export async function handleTokenRefresh(failedRequest: any): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const token = await refreshAccessToken();
    processQueue(null, token);
    return token;
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}