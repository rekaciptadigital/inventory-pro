import { STORAGE_KEYS } from "@/lib/config/constants";
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
  // Set tokens in cookie with security options
  Cookies.set(STORAGE_KEYS.TOKENS, JSON.stringify({
    ...tokens,
    expires_in: Date.now() + tokens.expires_in,
  }), {
    expires: tokens.expires_in / (1000 * 60 * 60 * 24), // Convert ms to days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearAuthData(): void {
  // Clear cookies
  Cookies.remove(STORAGE_KEYS.TOKENS);
  
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEYS.USER);
}