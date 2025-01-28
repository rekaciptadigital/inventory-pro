import { useState } from 'react';
import { usePriceManagementList } from './use-price-management-list';
import type { PriceManagementFilters } from '@/lib/api/price-management';

export function usePriceManagement(filters: PriceManagementFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = usePriceManagementList(filters);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading,
    error,
  };
}