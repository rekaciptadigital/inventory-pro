'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedTokens = getTokens();
        const storedUser = getCurrentUser();

        if (!storedTokens || !storedUser) {
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.replace('/login');
          }
          return;
        }

        try {
          const { data } = await authService.verifyToken(storedTokens.access_token);
          if (data.isValid) {
            initializeAuth({ user: storedUser, tokens: storedTokens });
            if (PUBLIC_PATHS.includes(pathname)) {
              router.replace('/dashboard');
            }
          } else {
            throw new Error('Invalid token');
          }
        } catch {
          logout();
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.replace('/login');
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return children;
}