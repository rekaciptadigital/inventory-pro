import { useQuery } from "@tanstack/react-query";
import { getVariantTypes } from "@/lib/api/variant-types";

/**
 * Custom hook untuk mengambil data tipe varian
 * Menggunakan React Query untuk state management dan caching
 *
 * @returns Query object yang berisi data tipe varian, status loading, dan error
 */
export function useVariantTypes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["variantTypes"],
    queryFn: () => getVariantTypes(),
  });

  return {
    variantTypes: data?.data || [],
    isLoading,
    error,
  };
}
