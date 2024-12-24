import { useState } from 'react';
import { useVariantList } from './use-variant-list';
import { useVariantMutations } from './use-variant-mutations';
import type { VariantFilters } from '@/lib/api/variants';

export function useVariants(filters: VariantFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = useVariantList(filters);
  const mutations = useVariantMutations();

  return {
    variants: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    ...mutations,
  };
}