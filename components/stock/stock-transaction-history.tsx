'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export function StockTransactionHistory() {
  const [date, setDate] = useState<Date>();
  const [transactionType, setTransactionType] = useState('all');
  const [search, setSearch] = useState('');

  // Mock data - replace with actual API data
  const transactions = [
    {
      id: 1,
      date: '2025-02-01',
      sku: 'P001',
      productName: 'Product A',
      type: 'in',
      quantity: 100,
      notes: 'Purchase Order #123',
    },
    {
      id: 2,
      date: '2025-02-03',
      sku: 'P001',
      productName: 'Product A',
      type: 'out',
      quantity: -20,
      notes: 'Sales Order #456',
    },
    {
      id: 3,
      date: '2025-02-05',
      sku: 'P002',
      productName: 'Product B',
      type: 'adjust',
      quantity: 5,
      notes: 'Stock Opname',
    },
  ];

  const getTransactionBadge = (type: string, quantity: number) => {
    switch (type) {
      case 'in':
        return <Badge variant="default">Inbound (+{quantity})</Badge>;
      case 'out':
        return <Badge variant="destructive">Outbound ({quantity})</Badge>;
      case 'adjust':
        return (
          <Badge variant="secondary">
            Adjustment ({quantity > 0 ? '+' : ''}{quantity})
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in">Inbound</SelectItem>
            <SelectItem value="out">Outbound</SelectItem>
            <SelectItem value="adjust">Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="font-medium">{transaction.sku}</TableCell>
                <TableCell>{transaction.productName}</TableCell>
                <TableCell>
                  {getTransactionBadge(transaction.type, transaction.quantity)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      'font-medium',
                      transaction.quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {transaction.quantity}
                  </span>
                </TableCell>
                <TableCell>{transaction.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}