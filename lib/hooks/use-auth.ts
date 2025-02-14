import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  login,
  logout,
  clearError,
  selectAuth,
} from '@/lib/store/slices/authSlice';
import type { LoginCredentials } from '@/lib/types/auth';
import { STORAGE_KEYS } from '@/lib/config/constants';

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
        throw error;
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
    
    // Clear auth data from localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    tokens,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
  };
}