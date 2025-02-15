'use client';

import { LoadingScreen } from './loading-screen';

interface PageLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export function PageLoading({ children, isLoading }: PageLoadingProps) {
  if (isLoading) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
}
