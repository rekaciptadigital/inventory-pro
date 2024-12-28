import { useQuery } from '@tanstack/react-query';
import { getVariantTypes, type VariantTypeFilters } from '@/lib/api/variant-types';

/**
 * Custom hook untuk mengambil data tipe varian
 * Menggunakan React Query untuk state management dan caching
 * 
 * @param filters - Parameter opsional untuk memfilter hasil query
 * @returns Query object yang berisi data tipe varian, status loading, dan error
 * 
 * Konfigurasi:
 * - Cache selama 5 menit
 * - Retry maksimal 2 kali jika gagal
 * - Tidak melakukan refetch saat window focus
 */
export function useVariantTypes(filters?: VariantTypeFilters) {
  return useQuery({
    queryKey: ['variantTypes', filters],
    queryFn: () => getVariantTypes(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    select: (data) => ({
      ...data,
      data: data.data.map(type => ({
        ...type,
        id: type.id.toString(),
        name: type.name || '',
        status: type.status ?? true,
      }))
    }),
    retry: 2,
    refetchOnWindowFocus: false,
  });
}