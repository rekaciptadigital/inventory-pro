'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { PriceEditForm } from './price-edit-form';
import type { InventoryProduct } from '@/types/inventory';

interface PriceHistoryProps {
  product: InventoryProduct;
}

export function PriceHistory({ product }: PriceHistoryProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Mock price history data - replace with actual API data
  const priceHistory = [
    {
      id: 1,
      date: new Date().toISOString(),
      basePrice: 100000,
      adjustmentPercentage: 10,
      finalPrice: 110000,
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      basePrice: 95000,
      adjustmentPercentage: 10,
      finalPrice: 104500,
    },
  ];

  return (
    <>
      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Price History</h2>
            <Button onClick={() => setIsEditing(true)}>
              Edit Price
            </Button>
          </div>
        </div>

        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Adjustment %</TableHead>
                <TableHead>Final Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{formatDate(history.date)}</TableCell>
                  <TableCell>{formatCurrency(history.basePrice)}</TableCell>
                  <TableCell>{history.adjustmentPercentage}%</TableCell>
                  <TableCell>{formatCurrency(history.finalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <PriceEditForm 
        product={product}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={() => setIsEditing(false)}
      />
    </>
  );
}