'use client';

import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { VariantSelection } from '../product-form/variant-selection';

interface VariantConfigurationProps {
  selectedVariants: Array<{ typeId: string; values: string[] }>;
  onVariantsChange: (variants: Array<{ typeId: string; values: string[] }>) => void;
}

export function VariantConfiguration({
  selectedVariants,
  onVariantsChange,
}: VariantConfigurationProps) {
  const { variantTypes } = useVariantTypes();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Variant Configuration</h3>
      
      <VariantSelection
        selectedVariants={selectedVariants}
        onVariantsChange={onVariantsChange}
      />

      {selectedVariants.length > 0 && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Variants</h4>
          <ul className="space-y-2">
            {selectedVariants.map((variant, index) => {
              const variantType = variantTypes.find(vt => vt.id === variant.typeId);
              const values = variant.values
                .map(valueId => {
                  const value = variantType?.values.find(v => v.id === valueId);
                  return value?.name;
                })
                .filter(Boolean)
                .join(', ');

              return (
                <li key={index} className="text-sm">
                  {variantType?.name}: {values}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}