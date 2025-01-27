import { useCallback } from "react";
import { ClientSelect } from "@/components/ui/enhanced-select/client-select";
import { useVariants } from "@/lib/hooks/use-variants";
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
}: VariantSelectorProps) {
  const { variants } = useVariants();

  const loadOptions = useCallback(
    async (search: string) => {
      const filteredVariants = variants
        .filter((variant) => !excludeIds.includes(variant.id))
        .filter((variant) =>
          variant.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((variant) => ({
          value: variant.id.toString(),
          label: variant.name,
          data: {
            id: variant.id,
            name: variant.name,
            values: variant.values, // Make sure values are included in the data
          },
        }));

      return {
        options: filteredVariants,
        hasMore: false,
        additional: {
          page: 1,
        },
      };
    },
    [variants, excludeIds]
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
      classNames={{
        control: () => "h-10",
        placeholder: () => "text-sm",
        input: () => "text-sm",
        option: () => "text-sm",
      }}
    />
  );
}
