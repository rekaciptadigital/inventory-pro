'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

// Mock data for locations - replace with actual data from API
const STOCK_LOCATIONS = [
  { id: 'loc1', name: 'Location 1' },
  { id: 'loc2', name: 'Location 2' },
  { id: 'loc3', name: 'Location 3' },
  { id: 'loc4', name: 'Location 4' },
];

// Mock data for stock - replace with actual data from API
const MOCK_STOCK_DATA = {
  loc1: { min: 10, lastUpdate: '2025-02-01 10:00:00', updatedBy: 'Admin' },
  loc2: { min: 15, lastUpdate: '2025-02-01 11:00:00', updatedBy: 'Manager' },
  loc3: { min: 5, lastUpdate: '2025-02-01 12:00:00', updatedBy: 'Staff' },
  loc4: { min: 8, lastUpdate: '2025-02-01 13:00:00', updatedBy: 'Supervisor' },
};

export function StockSummary() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  
  const { products, isLoading } = useInventory();

  // Function to get stock level status
  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'out';
    if (quantity <= minStock) return 'low';
    return 'ok';
  };

  // Function to get stock cell style based on status
  const getStockCellStyle = (quantity: number, minStock: number) => {
    const status = getStockStatus(quantity, minStock);
    return cn(
      'text-right font-medium',
      status === 'out' && 'text-destructive',
      status === 'low' && 'text-yellow-600 dark:text-yellow-500',
    );
  };

  if (isLoading) {
    return <div>Loading stock data...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {STOCK_LOCATIONS.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">SKU</TableHead>
                    <TableHead className="w-[250px]">Product Name</TableHead>
                    {STOCK_LOCATIONS.map(location => (
                      <TableHead key={location.id} className="w-[100px] text-right">
                        {location.name}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px] text-right">Total Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    // Mock stock data for each location
                    const locationStocks = STOCK_LOCATIONS.map(location => ({
                      quantity: Math.floor(Math.random() * 100),
                      ...MOCK_STOCK_DATA[location.id as keyof typeof MOCK_STOCK_DATA]
                    }));

                    const totalStock = locationStocks.reduce((sum, loc) => sum + loc.quantity, 0);

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.full_product_name}</TableCell>
                        {locationStocks.map((stock, index) => (
                          <TableCell key={index}>
                            <Tooltip>
                              <TooltipTrigger className="w-full">
                                <div className={getStockCellStyle(stock.quantity, stock.min)}>
                                  {stock.quantity}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs space-y-1">
                                  <p>Min Stock: {stock.min}</p>
                                  <p>Last Updated: {formatDate(stock.lastUpdate)}</p>
                                  <p>Updated By: {stock.updatedBy}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold">
                          {totalStock}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
}