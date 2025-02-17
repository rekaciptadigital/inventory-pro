'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens } from '@/lib/services/auth/storage.service';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const tokens = getTokens();
    const redirect = tokens ? '/dashboard' : '/login';
    router.replace(redirect);
  }, [router]);

  return <LoadingScreen />;
}
