'use client';

import type { Brand } from '@/types/brand';
import type { ProductType } from '@/types/product-type';
import type { VariantType } from '@/types/variant';

export function generateSKU(
  brand: Brand,
  productType: ProductType,
  variants?: Array<{typeId: string; values: string[]}>,
  variantTypes?: VariantType[]
): string {
  // Get brand code (use first 3 chars if no code)
  const brandCode = brand.code || brand.name.slice(0, 3).toUpperCase();
  
  // Get type code (use first 3 chars if no code)
  const typeCode = productType.code || productType.name.slice(0, 3).toUpperCase();
  
  // Generate variant part of SKU
  let variantCode = '';
  if (variants && variants.length > 0 && variantTypes) {
    variantCode = variants.map(variant => {
      const variantType = variantTypes.find(vt => vt.id === variant.typeId);
      if (!variantType || variant.values.length === 0) return '';
      
      // Use first value's first character
      const value = variantType.values.find(v => v.id === variant.values[0]);
      return value ? value.name.charAt(0).toUpperCase() : '';
    }).join('');
  }

  // Combine all parts with hyphens
  const parts = [brandCode, typeCode];
  if (variantCode) {
    parts.push(variantCode);
  }
  
  // Add sequential number to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  parts.push(timestamp);

  return parts.join('-');
}

export function generateVariantSKU(
  parentSku: string,
  variant: { typeId: string; values: string[] }
): string {
  const variantCode = variant.values
    .map(value => value.charAt(0).toUpperCase())
    .join('');
  
  return `${parentSku}-${variantCode}`;
}

export function generateFullProductName(
  brand: Brand,
  productType: ProductType,
  productName: string,
  variants?: Array<{typeId: string; values: string[]}>,
  variantTypes?: VariantType[]
): string {
  const parts = [brand.name, productType.name, productName];

  if (variants && variants.length > 0 && variantTypes) {
    const variantNames = variants.map(variant => {
      const variantType = variantTypes.find(vt => vt.id === variant.typeId);
      if (!variantType || variant.values.length === 0) return '';

      const values = variant.values.map(valueId => {
        const value = variantType.values.find(v => v.id === valueId);
        return value ? value.name : '';
      }).filter(Boolean);

      return values.join('/');
    }).filter(Boolean);

    if (variantNames.length > 0) {
      parts.push(`(${variantNames.join(', ')})`);
    }
  }

  return parts.join(' ');
}