import { useQuery } from "@tanstack/react-query";
import { getVariants } from "@/lib/api/variants";

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

  return {
    variants:
      response?.data?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        values: variant.values || [], // Make sure values exist
        display_order: variant.display_order,
      })) || [],
    isLoading,
    error,
  };
}
