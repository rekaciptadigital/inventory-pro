import { useQuery } from '@tanstack/react-query';
import { getProductTypes } from '@/lib/api/product-types';

// Use a more generic type definition
interface QueryFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export function useProductTypeList(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: ['productTypes', filters],
    queryFn: () => getProductTypes(filters),
    placeholderData: (previousData) => previousData,
  });
}