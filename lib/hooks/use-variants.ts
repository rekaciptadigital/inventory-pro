import { useQuery } from "@tanstack/react-query";
import { getVariants } from "@/lib/api/variants";

export interface VariantType {
  id: number;
  name: string;
  values: string[];
  display_order: number;
}

export function useVariants() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const result = await getVariants({
        page: 1,
        limit: 100,
        sort: "display_order",
        order: "ASC",
      });
      return result;
    },
  });

  const variants = response?.data?.map((variant): VariantType => ({
    id: variant.id,
    name: variant.name,
    values: variant.values || [],
    display_order: variant.display_order,
  })) || [];

  // Add a helper function to find variant by ID
  const findVariantById = (id: number) => variants.find((v) => v.id === id);

  return {
    variants,
    findVariantById,
    isLoading,
    error,
  };
}
