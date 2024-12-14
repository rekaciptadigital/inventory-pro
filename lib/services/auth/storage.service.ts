import { STORAGE_KEYS } from "@/lib/config/constants";
import type { AuthUser, AuthTokens } from "@/lib/types/auth";

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
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return tokensStr ? JSON.parse(tokensStr) : null;
  } catch {
    return null;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
}
