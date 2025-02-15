'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingScreen } from './loading-screen';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, tokens } = useAuth();
  
  useEffect(() => {
    if (user && tokens) {
      router.replace('/dashboard');
    }
  }, [user, tokens, router]);

  if (user && tokens) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
