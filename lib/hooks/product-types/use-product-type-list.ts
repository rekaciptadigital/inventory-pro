import { useQuery } from '@tanstack/react-query';
import { getProductTypes, type ProductTypeFilters } from '@/lib/api/product-types';

export function useProductTypeList(filters: ProductTypeFilters = {}) {
  return useQuery({
    queryKey: ['productTypes', filters],
    queryFn: () => getProductTypes(filters),
    placeholderData: (previousData) => previousData,
  });
}