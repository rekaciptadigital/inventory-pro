import { useQuery } from '@tanstack/react-query';
import { getPriceCategories, type PriceCategoryFilters } from '@/lib/api/price-categories';

export function usePriceCategoryList(filters: PriceCategoryFilters = {}) {
  return useQuery({
    queryKey: ['priceCategories', filters],
    queryFn: () => getPriceCategories(filters),
    keepPreviousData: true,
  });
}