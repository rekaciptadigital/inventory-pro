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
import { setTokens, setUser, clearAuthData } from '@/lib/services/auth/storage.service';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, tokens, isLoading, error } = useAppSelector(selectAuth);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        // Validate credentials
        if (!credentials.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        // Dispatch login action
        const result = await dispatch(login(credentials)).unwrap();
        
        // Store auth data
        setTokens(result.tokens);
        setUser(result.user);
        
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        throw new Error(message, { cause: error });
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } finally {
      clearAuthData();
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