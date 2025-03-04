import { useQuery } from "@tanstack/react-query";
import { getVariantTypes } from "@/lib/api/variant-types";
import type { VariantType } from "@/types/variant";

export interface VariantTypesResponse {
  data: VariantType[];
}

/**
 * Custom hook untuk mengambil data tipe varian
 */
export function useVariantTypes() {
  const { data, isLoading, error } = useQuery<VariantTypesResponse>({
    queryKey: ["variantTypes"],
    queryFn: () => getVariantTypes(),
  });

  return {
    variantTypes: data?.data || [],
    isLoading,
    error,
  };
}
