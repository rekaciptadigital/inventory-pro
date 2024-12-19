import { useQuery } from '@tanstack/react-query';
import { getTaxes, type TaxFilters } from '@/lib/api/taxes';

export function useTaxList(filters: TaxFilters = {}) {
  return useQuery({
    queryKey: ['taxes', filters],
    queryFn: () => getTaxes(filters),
    keepPreviousData: true,
  });
}