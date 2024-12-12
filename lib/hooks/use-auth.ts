import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store/store';
import { login, logout, clearError } from '@/lib/store/slices/authSlice';
import type { LoginCredentials } from '@/lib/types/auth';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, tokens, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (credentials: LoginCredentials) => {
    return dispatch(login(credentials)).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

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