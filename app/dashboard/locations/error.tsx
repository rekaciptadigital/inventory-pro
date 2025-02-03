'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface LocationErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function LocationError({
  error,
  reset,
}: LocationErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Location Management Error</h2>
      <p className="text-muted-foreground">
        {error.message || 'Something went wrong loading the locations'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}