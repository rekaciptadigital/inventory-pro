import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  login,
  logout,
  clearError,
  initializeAuth,
  selectAuth,
} from '@/lib/store/slices/authSlice';
import type { AuthUser, AuthTokens, LoginCredentials } from '@/lib/types/auth';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { clearAuthData } from '@/lib/services/auth/storage.service';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, tokens, isLoading, error } = useAppSelector(selectAuth);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await dispatch(login(credentials)).unwrap();
        
        // Store auth data in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(result.tokens));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
        
        return result;
      } catch (error) {
        // Rethrow with additional context
        throw new Error('Login failed', { cause: error });
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } finally {
      clearAuthData(); // Ensure local storage is always cleared
    }
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInitializeAuth = useCallback(
    (payload: { user: AuthUser; tokens: AuthTokens }) => {
      dispatch(initializeAuth(payload));
    },
    [dispatch]
  );

  return {
    user,
    tokens,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
    initializeAuth: handleInitializeAuth,
  };
}