"use client";

import type { Brand } from "@/types/brand";
import type { ProductType } from "@/types/product-type";
import type { VariantType } from "@/types/variant";
import { generateRandomDigits } from "./sku/random-generator"; // Perbaiki path impor

interface SkuBrand {
  id: number;
  code: string;
  name: string;
}

interface SkuProductType {
  id: number;
  code: string;
  name: string;
}

export function generateSKU(
  brand: SkuBrand,
  productType: SkuProductType,
  uniqueCode?: string
): string {
  if (!brand?.code || !productType?.code) {
    console.warn("Missing required data for SKU generation:", {
      brand,
      productType,
    });
    return "";
  }

  const brandCode = brand.code;
  const typeCode = productType.code;
  const code = uniqueCode || generateRandomDigits(4);

  return `${brandCode}${typeCode}${code}`.toUpperCase();
}

export function generateVariantSKU(
  baseSku: string,
  variant: { typeId: string; values: string[] },
  variantTypes: VariantType[]
): string {
  const variantType = variantTypes.find((vt) => vt.id === variant.typeId);
  if (!variantType) return baseSku;

  const variantCodes = variant.values
    .map((valueId) => {
      const value = variantType.values.find((v) => v.id === valueId);
      return value?.code || "";
    })
    .filter(Boolean)
    .join("");

  return `${baseSku}${variantCodes}`;
}

export function generateAllVariantSkus(
  baseSku: string,
  selectedVariants: Array<{ typeId: string; values: string[] }>,
  variantTypes: VariantType[]
): string[] {
  if (!baseSku || selectedVariants.length === 0) return [];

  // Get all variant combinations
  const combinations = getCombinations(selectedVariants, variantTypes);

  // Generate SKU for each combination
  return combinations.map((combination) => {
    const variantCodes = combination
      .map(({ typeId, valueId }) => {
        const variantType = variantTypes.find((vt) => vt.id === typeId);
        const value = variantType?.values.find((v) => v.id === valueId);
        return value?.code || "";
      })
      .join("");

    return `${baseSku}-${variantCodes}`;
  });
}

function getCombinations(
  selectedVariants: Array<{ typeId: string; values: string[] }>,
  variantTypes: VariantType[]
): Array<Array<{ typeId: string; valueId: string }>> {
  const combinations: Array<Array<{ typeId: string; valueId: string }>> = [[]];

  selectedVariants.forEach((variant) => {
    const currentCombinations = [...combinations];
    combinations.length = 0;

    variant.values.forEach((valueId) => {
      currentCombinations.forEach((combination) => {
        combinations.push([
          ...combination,
          { typeId: variant.typeId, valueId },
        ]);
      });
    });
  });

  return combinations;
}

// Helper function to generate unique identifiers
function generateUniqueIdentifier(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random}`.slice(-8);
}
