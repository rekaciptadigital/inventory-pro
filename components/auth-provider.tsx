'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { authService } from '@/lib/services/auth.service';
import { getTokens, getCurrentUser } from '@/lib/services/auth/storage.service';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, initializeAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Single useEffect for auth check and routing
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedTokens = getTokens();
        const storedUser = getCurrentUser();

        // No stored auth data
        if (!storedTokens?.access_token || !storedUser) {
          if (pathname !== '/login') {
            router.replace('/login');
          }
          return;
        }

        // Verify token
        const { data } = await authService.verifyToken(storedTokens.access_token);
        
        if (data.isValid) {
          initializeAuth({ user: storedUser, tokens: storedTokens });
          if (pathname === '/login') {
            router.replace('/dashboard');
          }
        } else {
          logout();
          router.replace('/login');
        }
      } catch (error) {
        logout();
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, logout, initializeAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}