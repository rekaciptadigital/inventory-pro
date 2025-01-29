'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Brand Management Error</h2>
      <p className="text-muted-foreground">
        {error.message || 'Something went wrong loading the brands'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}