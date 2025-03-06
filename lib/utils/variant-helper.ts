import { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

/**
 * Maps variant values to specific product variants
 */
export function mapVariantValuesToProductVariants(
  product: InventoryProduct
): InventoryProductVariant[] {
  return product.product_by_variant.map(variant => {
    // Create a copy of the variant
    const enhancedVariant = { ...variant };
    
    // Extract variant values from variant's full name
    enhancedVariant.variantValues = [];
    
    product.variants.forEach(variantType => {
      const matchedValue = variantType.values.find(value => 
        variant.full_product_name.toLowerCase().includes(value.variant_value_name.toLowerCase())
      );
      
      if (matchedValue) {
        enhancedVariant.variantValues!.push({
          variantId: variantType.variant_id,
          variantName: variantType.variant_name,
          valueId: matchedValue.variant_value_id,
          valueName: matchedValue.variant_value_name
        });
      }
    });
    
    return enhancedVariant;
  });
}

/**
 * Gets variant details for a specific product variant
 */
export function getVariantDetails(
  variant: InventoryProductVariant, 
  product: InventoryProduct
): Record<string, string> {
  const details: Record<string, string> = {};
  
  // If we already have processed variant values, use them
  if (variant.variantValues) {
    variant.variantValues.forEach(value => {
      details[value.variantName] = value.valueName;
    });
    return details;
  }
  
  // Otherwise try to extract from product data
  product.variants.forEach(variantType => {
    const matchedValue = variantType.values.find(value => 
      variant.full_product_name.toLowerCase().includes(value.variant_value_name.toLowerCase())
    );
    
    if (matchedValue) {
      details[variantType.variant_name] = matchedValue.variant_value_name;
    }
  });
  
  return details;
}
