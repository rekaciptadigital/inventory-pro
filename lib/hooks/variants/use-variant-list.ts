import { useQuery } from '@tanstack/react-query';
import { getVariants, type VariantFilters } from '@/lib/api/variants';

export function useVariantList(filters: VariantFilters = {}) {
  return useQuery({
    queryKey: ['variants', filters],
    queryFn: () => getVariants(filters),
    keepPreviousData: true,
  });
}