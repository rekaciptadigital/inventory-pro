import { STORAGE_KEYS, SESSION_CONFIG } from "@/lib/config/constants";
import type { AuthUser, AuthTokens } from "@/lib/types/auth";
import Cookies from 'js-cookie';

export function getCurrentUser(): AuthUser | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function getTokens(): AuthTokens | null {
  try {
    const tokensStr = Cookies.get(STORAGE_KEYS.TOKENS);
    return tokensStr ? JSON.parse(tokensStr) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  // Calculate expiry time
  const expiryDate = new Date(Date.now() + SESSION_CONFIG.ACCESS_TOKEN_EXPIRY);
  
  // Set tokens in cookie with security options
  Cookies.set(STORAGE_KEYS.TOKENS, JSON.stringify({
    ...tokens,
    expires_in: expiryDate.getTime(),
  }), {
    ...SESSION_CONFIG.COOKIE_OPTIONS,
    expires: expiryDate,
  });
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearAuthData(): void {
  // Clear cookies
  Cookies.remove(STORAGE_KEYS.TOKENS, SESSION_CONFIG.COOKIE_OPTIONS);
  
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEYS.USER);
}