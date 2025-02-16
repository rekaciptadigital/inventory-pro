'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('Auth initialization started', { pathname });
    
    const storedTokens = getTokens();
    const storedUser = getCurrentUser();
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    console.log('Auth state:', { 
      hasTokens: !!storedTokens, 
      hasUser: !!storedUser, 
      isPublicPath 
    });

    if (storedTokens && storedUser) {
      initializeAuth({ user: storedUser, tokens: storedTokens });
      if (isPublicPath) {
        router.replace('/dashboard');
      }
    } else if (!isPublicPath) {
      router.replace('/login');
    }

    // Immediately set initialized if we're on the correct path
    if ((storedTokens && storedUser && !isPublicPath) || 
        (!storedTokens && isPublicPath)) {
      setIsInitialized(true);
    } else {
      // Small delay only if we're redirecting
      setTimeout(() => setIsInitialized(true), 100);
    }

    console.log('Auth initialization completed');
  }, [pathname, router, initializeAuth]);

  if (!isInitialized) {
    console.log('Showing loading screen');
    return <LoadingScreen />;
  }

  console.log('Rendering children');
  return <>{children}</>;
}