import { useState } from 'react';
import { useProductTypeList } from './use-product-type-list';
import { useProductTypeMutations } from './use-product-type-mutations';
import type { ProductTypeFilters } from '@/lib/api/product-types';

export function useProductTypes(filters: ProductTypeFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = useProductTypeList(filters);
  const mutations = useProductTypeMutations();

  return {
    productTypes: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    ...mutations,
  };
}