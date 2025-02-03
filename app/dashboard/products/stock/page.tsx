'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockSummary } from '@/components/stock/stock-summary';
import { StockTransactionHistory } from '@/components/stock/stock-transaction-history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductStockPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Stock</h1>
          <p className="text-muted-foreground">
            Manage your product stock levels and transactions
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/products/stock/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stock Transaction
        </Button>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Stock Summary</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          <StockSummary />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <StockTransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}