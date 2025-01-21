import { useCallback } from "react";
import { ClientSelect } from "@/components/ui/enhanced-select/client-select";
import type { SelectOption } from "@/components/ui/enhanced-select";

interface VariantValueSelectorProps {
  values: string[];
  value: SelectOption | null;
  onChange: (selected: SelectOption | null) => void;
  name?: string;
  error?: string;
  isDisabled?: boolean;
}

export function VariantValueSelector({
  values,
  value,
  onChange,
  name,
  error,
  isDisabled = false,
}: VariantValueSelectorProps) {
  const loadOptions = useCallback(
    async (search: string) => {
      const filteredValues = values
        .filter((val) => val.toLowerCase().includes(search.toLowerCase()))
        .map((val) => ({
          value: val,
          label: val,
          data: val,
        }));

      return {
        options: filteredValues,
        hasMore: false,
        additional: {
          page: 1,
        },
      };
    },
    [values]
  );

  return (
    <ClientSelect
      name={name}
      loadOptions={loadOptions}
      value={value}
      onChange={onChange}
      defaultOptions
      isDisabled={isDisabled}
      placeholder="Select variant value..."
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
