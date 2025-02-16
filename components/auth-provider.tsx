'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getTokens, getCurrentUser, clearAuthData } from '@/lib/services/auth/storage.service';
import { useToast } from '@/components/ui/use-toast';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initializeAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const mountedRef = useRef(false);

  const safeNavigate = useCallback((path: string) => {
    setIsNavigating(true);
    router.push(path);
  }, [router]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const storedTokens = getTokens();
    const storedUser = getCurrentUser();
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (storedTokens && storedUser) {
      initializeAuth({ user: storedUser, tokens: storedTokens });
      if (isPublicPath) {
        safeNavigate('/dashboard');
      }
    } else {
      if (!isPublicPath) {
        safeNavigate('/login');
      }
    }

    setIsInitialized(true);
  }, [pathname, safeNavigate, initializeAuth]);

  if (!isInitialized || isNavigating) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}