'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductList } from '@/components/inventory/product-list';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';
import { resetFormState } from '@/lib/store/slices/formInventoryProductSlice';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function InventoryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  // Mempercepat debounce untuk pengalaman pencarian yang lebih responsif
  const debouncedSearchTerm = useDebounce(searchTerm, 200); 
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  
  // Optimasi inventory hook
  const inventoryParams = useMemo(() => ({
    search: debouncedSearchTerm.trim() || undefined,
    page: currentPage,
    limit: pageSize,
    sort: 'created_at',
    order: 'DESC' as const, // Fix: Use 'as const' to specify this is the literal "DESC" type
  }), [debouncedSearchTerm, currentPage, pageSize]);
  
  const { products, pagination, isLoading, deleteProduct } = useInventory(inventoryParams);

  // Reset ke halaman pertama saat search term berubah - optimasi dengan useCallback
  const resetToFirstPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(1);
    }
  }, [currentPage, handlePageChange]);

  useEffect(() => {
    resetToFirstPage();
  }, [debouncedSearchTerm, resetToFirstPage]);

  useEffect(() => {
    // Reset form state when inventory list page mounts
    dispatch(resetFormState());
  }, [dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Menampilkan info pencarian client-side
  const showSearchInfo = debouncedSearchTerm.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your archery equipment inventory
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/inventory/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU, Vendor SKU, variant vendor SKU, or product name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        {searchTerm && (
          <Button 
            variant="outline" 
            onClick={handleClearSearch}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Info pencarian yang lebih informatif */}
      {showSearchInfo && (
        <div className="text-sm text-muted-foreground">
          Searching for: "{debouncedSearchTerm}" (Results: {pagination?.totalItems ?? 0})
          {pagination?.totalItems === 0 && (
            <span className="ml-2 text-red-500 font-medium">
              No results found. Try a different search term.
            </span>
          )}
        </div>
      )}

      <ProductList 
        products={products}
        isLoading={isLoading}
        onDelete={deleteProduct}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={pagination?.totalItems ?? 0}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination?.totalPages ?? 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}