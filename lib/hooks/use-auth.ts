import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';
import {
  login,
  logout,
  clearError,
  initializeAuth,
  selectAuth,
} from '@/lib/store/slices/authSlice';
import type { AuthUser, AuthTokens, LoginCredentials } from '@/lib/types/auth';
import { setTokens, setUser, clearAuthData } from '@/lib/services/auth/storage.service';
import { getUserDetails } from '@/lib/api/users/profile';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
      clearAuthData();
      router.replace('/login');
    } catch (error) {
      // Still try to clean up and redirect even if logout fails
      clearAuthData();
      router.replace('/login');
    }
  }, [dispatch, router]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInitializeAuth = useCallback(
    (payload: { user: AuthUser; tokens: AuthTokens }) => {
      dispatch(initializeAuth(payload));
    },
    [dispatch]
  );

  const refreshUser = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await getUserDetails(user.id);
        
        if (response.data) {
          // Update the auth context with fresh data but keep tokens
          dispatch(initializeAuth({
            user: {
              ...response.data,
              // Make sure we retain the tokens
              tokens: user.tokens
            },
            tokens: user.tokens // Use existing tokens instead of undefined
          }));
          return true;
        }
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }, [user, dispatch]);

  return {
    user,
    tokens,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
    initializeAuth: handleInitializeAuth,
    refreshUser,
  };
}