import { useState, useCallback } from 'react';
import { useInventoryList } from './use-inventory-list';
import { useInventoryMutations } from './use-inventory-mutations';
import { getInventoryProduct } from '@/lib/api/inventory';
import type { InventoryFilters } from '@/lib/api/inventory';

export function useInventory(filters: InventoryFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = useInventoryList(filters);
  const mutations = useInventoryMutations();

  const getProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getInventoryProduct(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    getProduct,
    ...mutations,
  };
}