'use client';

import { AddStockTransactionForm } from '@/components/stock/add-stock-transaction-form';

export default function AddStockTransactionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Stock Transaction</h1>
        <p className="text-muted-foreground">
          Record a new stock transaction
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <AddStockTransactionForm />
      </div>
    </div>
  );
}