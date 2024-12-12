import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  login,
  logout,
  clearError,
  selectAuth,
} from '@/lib/store/slices/authSlice';
import type { LoginCredentials } from '@/lib/types/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, tokens, isLoading, error } = useAppSelector(selectAuth);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(login(credentials)).unwrap();
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
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