import { useState } from 'react';
import { usePriceCategoryList } from './use-price-category-list';
import { usePriceCategoryMutations } from './use-price-category-mutations';
import type { PriceCategoryFilters } from '@/lib/api/price-categories';

export function usePriceCategories(filters: PriceCategoryFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = usePriceCategoryList(filters);
  const mutations = usePriceCategoryMutations();

  const customerCategories = data?.data.filter(cat => cat.type === 'Customer') || [];
  const ecommerceCategories = data?.data.filter(cat => cat.type === 'Ecommerce') || [];

  return {
    customerCategories,
    ecommerceCategories,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    ...mutations,
  };
}