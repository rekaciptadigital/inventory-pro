export interface ProductCategory {
  product_category_id: number;
  category_hierarchy: number;
  category_name: string;
}

export interface VariantValue {
  variant_value_id: string;
  variant_value_name: string;
}

export interface ProductVariant {
  variant_id: number;
  variant_name: string;
  variant_values: VariantValue[];
}

export interface VariantSelectorData {
  id: number;
  name: string;
  values: string[]; // Keep as string[] for backwards compatibility
  selected_values?: string[];
  display_order?: number;
}

export interface ProductByVariant {
  originalSkuKey?: string;  // This is the property TypeScript is expecting
  sku: string;
  sku_product_unique_code: string;
  full_product_name: string;
  vendor_sku?: string;
  status?: boolean;
}

export interface InventoryProductForm {
  brand_id: number | null;
  brand_code: string;
  brand_name: string;
  product_type_id: number | null;
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
  categories: ProductCategory[];
  availableCategories: ProductCategory[];
  variants: ProductVariant[];
  product_by_variant: ProductByVariant[];
  variant_selectors: VariantSelectorData[];
}
