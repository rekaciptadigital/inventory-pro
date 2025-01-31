export interface ProductCategory {
  product_category_id: number;
  product_category_parent: number | null;
  product_category_name: string;
  category_hierarchy: number; // Ensure this is explicitly typed as number
}

export interface ProductVariant {
  variant_id: number;  // Change from string to number
  variant_name: string;
  variant_values: Array<{
    variant_value_id: string;
    variant_value_name: string;
  }>;
}

export interface ProductByVariant {
  full_product_name: string;
  sku: string;
  sku_product_unique_code: string;
}

export interface VariantSelectorData {
  id: number;
  name: string;
  values: string[];
  selected_values?: string[];
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
  variants: ProductVariant[];
  product_by_variant: ProductByVariant[];
  variant_selectors: VariantSelectorData[];
}
