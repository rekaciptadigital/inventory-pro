'use client';

interface VariantInfo {
  type: string;
  values: string[];
}

export function generateVariantName(
  brand: string,
  productType: string,
  productName: string,
  variantInfo: VariantInfo[]
): string {
  const variantParts = variantInfo
    .map(info => info.values.join(', '))
    .filter(Boolean)
    .join(' ');

  return `${brand} ${productType} ${productName} ${variantParts}`.trim();
}