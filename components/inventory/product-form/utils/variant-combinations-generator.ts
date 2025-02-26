import type { 
  SelectedVariant, 
  CombinationsGeneratorProps,
  VariantTypeData 
} from '../types/variant-types';

/**
 * Generates all possible combinations of variants
 */
function generateCombinations(variants: SelectedVariant[], variantTypes: VariantTypeData[]): string[][] {
  if (variants.length === 0) return [[]];

  const sortedVariants = [...variants].sort((a, b) => {
    const typeA = variantTypes?.find((vt: VariantTypeData) => vt.id === a.typeId);
    const typeB = variantTypes?.find((vt: VariantTypeData) => vt.id === b.typeId);
    
    const orderA = typeA?.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = typeB?.display_order ?? Number.MAX_SAFE_INTEGER;
    
    return orderA - orderB;
  });

  let combinations: string[][] = [[]];
  
  sortedVariants.forEach(variant => {
    const newCombinations: string[][] = [];
    combinations.forEach(combo => {
      variant.values.forEach(value => {
        newCombinations.push([...combo, value]);
      });
    });
    combinations = newCombinations;
  });

  return combinations;
}

/**
 * Converts variant types values to strings if needed
 */
function mapVariantTypeValues(variantTypes: VariantTypeData[]) {
  if (!variantTypes) return [];
  
  return variantTypes.map((vt: VariantTypeData) => ({
    ...vt,
    values: Array.isArray(vt.values) 
      ? vt.values.map(v => typeof v === 'string' ? v : v.name)
      : []
  }));
}

/**
 * Generates product variants based on selected variant combinations
 */
export function generateVariantCombinations({
  selectedVariants,
  variantTypes,
  variantUniqueCodes,
  baseSku,
  full_product_name
}: CombinationsGeneratorProps) {
  const processedVariantTypes = mapVariantTypeValues(variantTypes);
  
  const validVariants = selectedVariants
    .filter((v) => v.typeId && v.values.length > 0)
    .sort((a, b) => {
      const typeA = processedVariantTypes?.find(vt => vt.id === a.typeId);
      const typeB = processedVariantTypes?.find(vt => vt.id === b.typeId);
      const orderA = typeA?.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = typeB?.display_order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

  const combinations = generateCombinations(validVariants, processedVariantTypes);

  return combinations.map((combo, index) => {
    const defaultUniqueCode = String(index + 1).padStart(4, "0");
    const originalSkuKey = `${baseSku}-${index + 1}`;
    const storedUniqueCode = variantUniqueCodes[originalSkuKey];
    const uniqueCode = storedUniqueCode || defaultUniqueCode;

    return {
      originalSkuKey,
      skuKey: `${baseSku}-${uniqueCode}`,
      productName: `${full_product_name} ${combo.join(" ")}`,
      uniqueCode,
      combo,
    };
  });
}
