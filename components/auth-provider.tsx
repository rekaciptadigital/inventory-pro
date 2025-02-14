'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { authService } from '@/lib/services/auth.service';
import { STORAGE_KEYS } from '@/lib/config/constants';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, tokens } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
        if (!tokens) {
          setIsValidating(false);
          return;
        }

        const { access_token } = JSON.parse(tokens);
        const response = await authService.verifyToken(access_token);

        if (!response.data.isValid) {
          // Clear invalid session
          localStorage.removeItem(STORAGE_KEYS.TOKENS);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } catch (error) {
        // Clear session on error
        localStorage.removeItem(STORAGE_KEYS.TOKENS);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    if (isValidating) return;

    const isAuthPage = pathname === '/login';
    
    if (user && tokens && isAuthPage) {
      router.replace('/dashboard');
    } else if ((!user || !tokens) && !isAuthPage) {
      const searchParams = new URLSearchParams({
        callbackUrl: pathname,
      });
      router.replace(`/login?${searchParams.toString()}`);
    }
  }, [user, tokens, pathname, router, isValidating]);

  if (isValidating) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}