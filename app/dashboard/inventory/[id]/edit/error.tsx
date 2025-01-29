'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Error Editing Product</h2>
      <p className="text-muted-foreground">
        {error.message || 'Something went wrong while editing the product'}
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}