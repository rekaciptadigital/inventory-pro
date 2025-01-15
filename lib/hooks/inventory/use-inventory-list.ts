import { useQuery } from '@tanstack/react-query';
import { getInventoryProducts, type InventoryFilters } from '@/lib/api/inventory';

export function useInventoryList(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => getInventoryProducts(filters),
    keepPreviousData: true,
  });
}