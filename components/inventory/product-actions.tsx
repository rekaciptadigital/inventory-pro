'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductActions() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/dashboard/inventory/new')}>
      <Plus className="mr-2 h-4 w-4" />
      Add New Product
    </Button>
  );
}