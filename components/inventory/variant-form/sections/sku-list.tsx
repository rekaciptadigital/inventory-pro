'use client';

import { useMemo } from 'react';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { generateAllVariantSkus } from '@/lib/utils/sku-generator';

interface SkuListProps {
  baseSku: string;
  selectedVariants: Array<{ typeId: string; values: string[] }>;
}

export function SkuList({ baseSku, selectedVariants }: SkuListProps) {
  const { variantTypes } = useVariantTypes();

  const generatedSkus = useMemo(() => {
    if (!baseSku || selectedVariants.length === 0) return [];

    const skus = generateAllVariantSkus(baseSku, selectedVariants, variantTypes);
    
    return skus.map(sku => {
      // Extract variant codes from SKU (after the dash)
      const variantCodes = sku.split('-')[1];
      
      // Map each variant type to its selected values
      const variantInfo = selectedVariants.map(variant => {
        const variantType = variantTypes.find(t => t.id === variant.typeId);
        if (!variantType) return '';

        const values = variant.values
          .map(valueId => {
            const value = variantType.values.find(v => v.id === valueId);
            // Only include values whose codes are in the SKU
            if (value && variantCodes.includes(value.code)) {
              return value.name;
            }
            return null;
          })
          .filter(Boolean);

        return `${variantType.name} ${values.join(', ')}`;
      }).filter(Boolean);

      return {
        sku,
        variantInfo: variantInfo.join(' | '),
      };
    });
  }, [baseSku, selectedVariants, variantTypes]);

  if (generatedSkus.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {generatedSkus.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <p className="font-medium">{item.sku}</p>
            <p className="text-sm text-muted-foreground">
              {item.variantInfo}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}