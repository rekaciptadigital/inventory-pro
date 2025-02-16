import { STORAGE_KEYS } from "@/lib/config/constants";
import type { AuthUser, AuthTokens } from "@/lib/types/auth";

export function getTokens(): AuthTokens | null {
  try {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setAuthData(tokens: AuthTokens, user: AuthUser): void {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
  localStorage.removeItem(STORAGE_KEYS.USER);
}