import { useQuery } from '@tanstack/react-query';
import { getVariantTypes, type VariantTypeFilters } from '@/lib/api/variant-types';

/**
 * Hook untuk mengambil data tipe varian
 * Menggunakan React Query untuk caching dan manajemen state
 * @param filters - Parameter untuk memfilter data varian
 * @returns Query object dengan data tipe varian
 */
export function useVariantTypes(filters?: VariantTypeFilters) {
  return useQuery({
    queryKey: ['variantTypes', filters],
    queryFn: () => getVariantTypes(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}