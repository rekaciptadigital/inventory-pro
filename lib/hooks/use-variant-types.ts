import { useQuery } from '@tanstack/react-query';
import { getVariantTypes, type VariantTypeFilters } from '@/lib/api/variant-types';

export function useVariantTypes(filters?: VariantTypeFilters) {
  return useQuery({
    queryKey: ['variantTypes', filters],
    queryFn: () => getVariantTypes(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    select: (data) => ({
      ...data,
      data: data.data.map(type => ({
        ...type,
        // Ensure consistent data structure
        id: type.id.toString(),
        name: type.name || '',
        status: type.status ?? true,
      }))
    })
  });
}