import React, { useCallback } from 'react';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  VariantTypeSelector as VariantType,
  VariantValueSelector as VariantValueSelect,
} from "../enhanced-selectors";
import type { SelectOption } from "@/components/ui/enhanced-select";
import type { SelectedVariant, VariantValue, VariantTypeData } from "../types/variant-types";

/**
 * Helper to get the name of a variant value whether it's a string or object
 */
function getValueName(value: string | VariantValue): string {
  return typeof value === 'string' ? value : value.name;
}

interface VariantsListProps {
  readonly selectedVariants: readonly SelectedVariant[];
  readonly variantSelectors: readonly any[];
  readonly usedTypeIds: readonly number[];
  readonly variantTypes: readonly VariantTypeData[];
  readonly onTypeChange: (variantId: string, selected: SelectOption | null) => void;
  readonly onValuesChange: (variantId: string, selected: SelectOption[]) => void;
  readonly onRemoveVariant: (variantId: string) => void;
}

export function VariantsList({
  selectedVariants,
  variantSelectors,
  usedTypeIds,
  variantTypes,
  onTypeChange,
  onValuesChange,
  onRemoveVariant
}: VariantsListProps) {
  
  const renderVariantValue = useCallback(
    (variant: SelectedVariant, currentSelector?: any) => {
      const valueOptions = variant.values.map((value) => ({
        value: value,
        label: value,
        data: value,
      }));
      
      // Process the values from the selector
      let selectorValues: string[] = [];
      if (currentSelector?.values) {
        if (Array.isArray(currentSelector.values)) {
          selectorValues = currentSelector.values.map(
            (v: string | VariantValue) => typeof v === 'string' ? v : v.name
          );
        }
      }

      return (
        <VariantValueSelect
          key={`value-${variant.id}-${variant.typeId}-${variant.values.join(",")}`}
          values={selectorValues}
          value={valueOptions}
          onChange={(selected) => onValuesChange(variant.id, selected)}
          isDisabled={!variant.typeId}
        />
      );
    },
    [onValuesChange]
  );

  return (
    <>
      {selectedVariants.map((variant) => {
        const selector = variantSelectors.find(
          (selector) => selector.id === variant.typeId
        );
        
        const currentSelector = selector ? {
          id: selector.id,
          name: selector.name,
          values: selector.values,
          selected_values: selector.selected_values || [],
        } : undefined;
        
        const variantType = variantTypes?.find(
          (vt: VariantTypeData) => vt.id === variant.typeId
        );

        return (
          <div key={variant.id} className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto] gap-3 items-start">
            <div className="w-full min-w-[180px]">
              <VariantType
                key={`type-${variant.id}`}
                value={variant.typeId ? {
                  value: variant.typeId.toString(),
                  label: variantType?.name ?? currentSelector?.name ?? "",
                  data: {
                    id: variant.typeId,
                    name: variantType?.name ?? currentSelector?.name ?? "",
                    values: variantType?.values ?? currentSelector?.values ?? [],
                  },
                } : null}
                onChange={(selected) => onTypeChange(variant.id, selected)}
                excludeIds={usedTypeIds.filter((id) => id !== variant.typeId)}
              />
            </div>
            <div className="w-full min-w-[200px]">
              {renderVariantValue(variant, currentSelector)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="self-start mt-0"
              onClick={() => onRemoveVariant(variant.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </>
  );
}
