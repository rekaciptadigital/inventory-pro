import { useCallback } from "react";
import { ClientSelect } from "@/components/ui/enhanced-select/client-select";
import { getVariants } from "@/lib/api/variants";
import type { SelectOption } from "@/components/ui/enhanced-select";

interface VariantSelectorProps {
  value: SelectOption | null;
  onChange: (selected: SelectOption | null) => void;
  excludeIds?: number[];
  error?: string;
}

export function VariantSelector({
  value,
  onChange,
  excludeIds = [],
  error,
}: Readonly<VariantSelectorProps>) {
  const loadOptions = useCallback(
    async (search: string, loadedOptions: SelectOption[], { page }: { page: number }) => {
      try {
        const response = await getVariants({
          search,
          page,
          limit: 10,
          sort: "created_at",
          order: "DESC",
        });

        const filteredVariants = response.data
          .filter((variant) => !excludeIds.includes(variant.id))
          .map((variant) => ({
            value: variant.id.toString(),
            label: variant.name,
            data: {
              id: variant.id,
              name: variant.name,
              values: variant.values,
            },
          }));

        return {
          options: filteredVariants,
          hasMore: response.pagination?.hasNext || false,
          additional: {
            page: page + 1,
            hasMore: response.pagination?.hasNext || false,
          },
        };
      } catch (error) {
        console.error("Error loading variants:", error);
        return {
          options: [],
          hasMore: false,
          additional: { page: 1, hasMore: false },
        };
      }
    },
    [excludeIds]
  );

  return (
    <ClientSelect
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      defaultOptions
      placeholder="Select variant type..."
      error={error}
      isClearable={false}
      className="w-full" // Changed from classNames to className
    />
  );
}
