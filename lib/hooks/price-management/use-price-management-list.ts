import { useQuery } from '@tanstack/react-query';
import { getPriceManagementProducts, type PriceManagementFilters } from '@/lib/api/price-management';

export function usePriceManagementList(filters: PriceManagementFilters = {}) {
  return useQuery({
    queryKey: ['priceManagement', filters],
    queryFn: () => getPriceManagementProducts(filters),
    keepPreviousData: true,
  });
}