'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getTokens, getCurrentUser } from '@/lib/services/auth/storage.service';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initializeAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initialize = () => {
      const storedTokens = getTokens();
      const storedUser = getCurrentUser();
      const isPublicPath = PUBLIC_PATHS.includes(pathname);

      if (storedTokens && storedUser) {
        initializeAuth({ user: storedUser, tokens: storedTokens });
        if (isPublicPath && pathname !== '/') {
          router.replace('/dashboard');
        }
      } else if (!isPublicPath && pathname !== '/') {
        router.replace('/login');
      }

      setIsChecking(false);
    };

    initialize();
  }, [pathname]);

  // Don't show loading screen for root path
  if (isChecking && pathname !== '/') {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}