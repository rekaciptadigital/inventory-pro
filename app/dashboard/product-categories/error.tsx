'use client';

// Komponen error boundary untuk halaman kategori
// Menampilkan pesan error dan tombol untuk mencoba ulang
// Digunakan Next.js untuk menangkap error di level page

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CategoryErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function CategoryError({
  error,
  reset,
}: CategoryErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Category Management Error</h2>
      <p className="text-muted-foreground">
        {error.message || 'Something went wrong loading the categories'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}