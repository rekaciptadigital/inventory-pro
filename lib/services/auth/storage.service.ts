import { STORAGE_KEYS } from "@/lib/config/constants";
import type { AuthUser, AuthTokens } from "@/lib/types/auth";

export function getTokens(): AuthTokens | null {
  try {
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!tokensStr) return null;
    
    const tokens = JSON.parse(tokensStr);
    return tokens;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify({
    ...tokens,
    expires_in: Date.now() + tokens.expires_in,
  }));
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
  localStorage.removeItem(STORAGE_KEYS.USER);
}