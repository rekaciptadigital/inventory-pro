export interface InventoryProduct {
  id: number | string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  brand_id: string;
  brand_code: string;
  brand_name: string;
  product_type_id: string;
  product_type_code: string;
  product_type_name: string;
  unique_code: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  vendor_sku: string;
  description: string;
  unit: string;
  slug: string;
  categories: InventoryCategory[];
  variants: InventoryVariant[]; // Keep this one with specific type
  product_by_variant: InventoryProductVariant[];
  // Additional pricing fields
  usdPrice?: number;
  exchangeRate?: number;
  hbReal?: number;
  adjustmentPercentage?: number;
  hbNaik?: number;
  customerPrices?: Record<string, {
    basePrice: number;
    taxAmount: number;
    taxInclusivePrice: number;
    appliedTaxPercentage: number;
  }>;
  percentages?: Record<string, number>;
  price?: number;
  base_price?: number;
}

export interface InventoryCategory {
  id: number;
  created_at: string;
  inventory_product_id: number;
  product_category_id: string;
  product_category_parent: string | null;
  product_category_name: string;
  category_hierarchy: number;
}

export interface InventoryVariant {
  id: number;
  created_at: string;
  inventory_product_id: number;
  variant_id: string;
  variant_name: string;
  values: InventoryVariantValue[];
}

export interface InventoryVariantValue {
  id: number;
  created_at: string;
  inventory_product_variant_id: number;
  variant_value_id: string;
  variant_value_name: string;
}

export interface InventoryProductVariant {
  variant_combination: any;
  variant_combination_data: any;
  id: string;
  created_at?: string;
  updated_at?: string;
  inventory_product_id?: number;
  full_product_name: string;
  sku_product_variant: string;
  sku_product_unique_code: string;
  sku_vendor?: string | null; // Add this property
  deleted_at?: string | null;
  status: boolean;
  // Optional field to store variant values when processed client-side
  variantValues?: Array<{
    variantId: string;
    variantName: string;
    valueId: string;
    valueName: string;
  }>;
}

export interface CustomerCategory {
  id: number;
  name: string;
  percentage: number;
}