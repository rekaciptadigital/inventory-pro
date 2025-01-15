'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductActions } from '@/components/inventory/product-actions';
import { ProductList } from '@/components/inventory/product-list';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { usePagination } from '@/lib/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  
  const { products, pagination, isLoading } = useInventory({
    search: searchTerm,
    page: currentPage,
    limit: pageSize,
    sort: 'created_at',
    order: 'DESC',
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handlePageChange(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your archery equipment inventory
          </p>
        </div>
        <ProductActions />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand, SKU, or product name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ProductList 
        products={products}
        isLoading={isLoading}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={pagination?.totalItems || 0}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}