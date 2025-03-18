'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StockTransactionForm } from '@/components/stock/stock-transaction-form';

export default function StockTransactionPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Transaction</h1>
          <p className="text-muted-foreground">
            Manage inventory with barcode scanning: incoming, outgoing, and transfers
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/products/stock')}>
          Back to Stock Summary
        </Button>
      </div>

      <StockTransactionForm />
    </div>
  );
}