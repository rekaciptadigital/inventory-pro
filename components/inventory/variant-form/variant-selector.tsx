'use client';

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { 
  VariantTypeSelector, 
  VariantValueSelector 
} from "@/components/inventory/product-form/enhanced-selectors";
import type { SelectOption } from "@/components/ui/enhanced-select";

interface VariantSelectorProps {
  id: string;
  typeId: number;
  values: string[];
  usedTypeIds: number[];
  variantTypeName?: string;
  availableValues?: string[];
  onTypeChange: (id: string, selected: SelectOption | null) => void;
  onValuesChange: (id: string, selected: SelectOption[]) => void;
  onRemove: (id: string) => void;
}

export function VariantSelector({
  id,
  typeId,
  values,
  usedTypeIds,
  variantTypeName,
  availableValues = [],
  onTypeChange,
  onValuesChange,
  onRemove
}: VariantSelectorProps) {
  const valueOptions = values.map((value) => ({
    value,
    label: value,
    data: value,
  }));

  return (
    <div className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto] gap-3 items-start">
      <div className="w-full min-w-[180px]">
        <VariantTypeSelector
          value={typeId ? {
            value: typeId.toString(),
            label: variantTypeName || "",
            data: {
              id: typeId,
              name: variantTypeName || "",
              values: availableValues || [],
            },
          } : null}
          onChange={(selected) => onTypeChange(id, selected)}
          excludeIds={usedTypeIds.filter((tid) => tid !== typeId)}
        />
      </div>
      <div className="w-full min-w-[200px]">
        <VariantValueSelector
          values={availableValues || []}
          value={valueOptions}
          onChange={(selected) => onValuesChange(id, selected)}
          isDisabled={!typeId}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="self-start mt-0"
        onClick={() => onRemove(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
