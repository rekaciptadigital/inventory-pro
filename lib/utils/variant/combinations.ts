import type { VariantType } from '@/types/variant';

/**
 * Interface untuk kombinasi varian
 * Mendefinisikan struktur data untuk setiap kombinasi varian yang dihasilkan
 */
export interface VariantCombination {
  values: Array<{
    typeId: number;  // Changed from string to number
    valueId: number; // Changed from string to number
    typeName: string;
    valueName: string;
    order: number;
  }>;
}

/**
 * Fungsi untuk menghasilkan semua kombinasi varian yang mungkin
 * @param selectedVariants - Array varian yang dipilih dengan typeId dan values
 * @param variantTypes - Data master tipe varian
 * @returns Array kombinasi varian yang mungkin
 */
export function generateVariantCombinations(
  selectedVariants: Array<{ typeId: number; values: string[] }>,
  variantTypes: VariantType[] = []  // Add default empty array
): VariantCombination[] {
  if (!Array.isArray(variantTypes)) return [];  // Early return if invalid input
  
  const combinations: VariantCombination[] = [{ values: [] }];

  selectedVariants.forEach(variant => {
    if (!variant?.typeId) return;  // Skip if no valid typeId

    const variantType = variantTypes.find(t => t?.id === variant.typeId);
    if (!variantType) return;

    const currentCombinations = [...combinations];
    combinations.length = 0;

    variant.values.forEach(valueName => {
      if (!valueName) return;  // Skip empty values

      currentCombinations.forEach(combination => {
        combinations.push({
          values: [
            ...combination.values,
            {
              typeId: variant.typeId,
              valueId: variant.typeId, // Using typeId as valueId temporarily
              typeName: variantType.name,
              valueName: valueName,
              order: variantType.display_order ?? 999, // Changed from || to ??
            },
          ],
        });
      });
    });
  });

  return combinations;
}

/**
 * Fungsi untuk memformat nama varian lengkap
 * Menggabungkan informasi brand, tipe produk, nama produk, dan kombinasi varian
 * @param brand - Nama brand
 * @param productType - Tipe produk
 * @param productName - Nama produk
 * @param combination - Kombinasi varian
 * @returns String nama varian lengkap
 */
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