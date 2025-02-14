import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export function useAuthRedirect() {
  const router = useRouter();
  const { user, tokens } = useAuth();
  
  useEffect(() => {
    // Get current path from window location since we're client-side
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/login';
    
    if (user && tokens && isAuthPage) {
      // Redirect authenticated users away from login
      router.replace('/dashboard');
    } else if ((!user || !tokens) && !isAuthPage) {
      // Redirect unauthenticated users to login
      const searchParams = new URLSearchParams({
        callbackUrl: currentPath,
      });
      router.replace(`/login?${searchParams.toString()}`);
    }
  }, [user, tokens, router]);
}