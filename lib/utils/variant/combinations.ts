import type { VariantType } from '@/types/variant';

export interface VariantCombination {
  values: Array<{
    typeId: string;
    valueId: string;
    typeName: string;
    valueName: string;
    order: number;
  }>;
}

export function generateVariantCombinations(
  selectedVariants: Array<{ typeId: string; values: string[] }>,
  variantTypes: VariantType[]
): VariantCombination[] {
  const combinations: VariantCombination[] = [{ values: [] }];

  selectedVariants.forEach(variant => {
    const variantType = variantTypes.find(t => t.id === variant.typeId);
    if (!variantType) return;

    const currentCombinations = [...combinations];
    combinations.length = 0;

    variant.values.forEach(valueId => {
      const value = variantType.values.find(v => v.id === valueId);
      if (!value) return;

      currentCombinations.forEach(combination => {
        combinations.push({
          values: [
            ...combination.values,
            {
              typeId: variant.typeId,
              valueId,
              typeName: variantType.name,
              valueName: value.name,
              order: variantType.order || 999, // Default to high number if no order
            },
          ],
        });
      });
    });
  });

  return combinations;
}

export function formatVariantName(
  brand: string,
  productType: string,
  productName: string,
  combination: VariantCombination
): string {
  // Sort values by order
  const sortedValues = [...combination.values].sort((a, b) => a.order - b.order);
  
  const variantParts = sortedValues
    .map(value => value.valueName)
    .join(' ');

  return `${brand} ${productType} ${productName} ${variantParts}`.trim();
}