'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { authService } from '@/lib/services/auth.service';
import { getTokens, getCurrentUser } from '@/lib/services/auth/storage.service';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, initializeAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  const handleNavigation = useCallback((path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }, [router]);

  const verifyAuth = useCallback(async () => {
    const storedTokens = getTokens();
    const storedUser = getCurrentUser();

    if (!storedTokens || !storedUser) {
      return false;
    }

    try {
      const { data } = await authService.verifyToken(storedTokens.access_token);
      if (data.isValid) {
        initializeAuth({ user: storedUser, tokens: storedTokens });
        return true;
      }
    } catch {
      logout();
    }

    return false;
  }, [initializeAuth, logout]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const isValid = await verifyAuth();

      if (!isMounted) return;

      if (!isValid && !PUBLIC_PATHS.includes(pathname)) {
        handleNavigation('/login');
      } else if (isValid && PUBLIC_PATHS.includes(pathname)) {
        handleNavigation('/dashboard');
      }

      setIsInitialized(true);
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, verifyAuth, handleNavigation]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}