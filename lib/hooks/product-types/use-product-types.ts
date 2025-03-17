import { useProductTypeList } from './use-product-type-list';
import { useProductTypeMutations } from './use-product-type-mutations';
import type { ProductTypeFilters } from '@/lib/api/product-types';

export function useProductTypes(filters: ProductTypeFilters = {}) {
  const { data, isLoading: isLoadingList, error } = useProductTypeList(filters);
  const { isLoading: isMutationLoading, ...mutationMethods } = useProductTypeMutations();

  return {
    productTypes: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isMutationLoading,
    error,
    ...mutationMethods,
  };
}