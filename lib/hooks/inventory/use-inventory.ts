import { useState } from 'react';
import { useInventoryList } from './use-inventory-list';
import type { InventoryFilters } from '@/lib/api/inventory';

export function useInventory(filters: InventoryFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = useInventoryList(filters);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading,
    error,
  };
}