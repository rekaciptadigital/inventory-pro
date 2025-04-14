export interface PriceFormFields {
  usdPrice: number;
  exchangeRate: number;
  hbReal: number;
  adjustmentPercentage: number;
  hbNaik: number;
  customerPrices: Record<string, CustomerPrice>;
  marketplacePrices?: Record<string, MarketplacePrice>;
  percentages: Record<string, number>;
  variantPrices: Record<string, VariantPrice>;
  pricingInformation: {
    usdPrice: number;
    adjustmentPercentage: number;
  };
  isManualVariantPriceEdit: boolean;
  isEnableVolumeDiscount: boolean;
  isEnableVolumeDiscountByProductVariant: boolean;
  globalVolumeDiscounts?: VolumeDiscountData[];
  variantVolumeDiscounts?: VariantVolumeDiscountData[];
  defaultPriceCategoryId?: string; // Add the missing field
  marketplacePercentages?: Record<string, number>; // Also adding this as it's being used
  marketplaces?: Record<string, any>; // Adding this as it's referenced in getMarketplaceMarkup
  currentEditingVariantSku?: string; // Add this field to store the variant being edited
}

export interface CustomerPrice {
  preTaxPrice: number;
  taxInclusivePrice: number;
  rawTaxInclusivePrice?: number; // Add this property for original price before rounding
  isCustomTaxInclusivePrice: boolean;
  taxPercentage: number;
  customPercentage?: number;
  name?: string; // Add name property
  markup?: number;  // Add markup property
  basePrice?: number; // Add basePrice property since it's also used in the code
  taxAmount?: number; // Add this as it's referenced in the code
}

export interface MarketplacePrice {
  price: number;
  rawPrice?: number; // Add this property for original price before rounding
  rawTaxInclusivePrice?: number; // Also add this for consistency
  taxInclusivePrice?: number; // Add this for consistency with access patterns
  isCustomPrice: boolean;
  customPercentage: number;
  name?: string; // Add name property for consistency
  markup?: number; // Add this for consistency
}

export interface VariantPrice {
  usdPrice?: number;
  exchangeRate?: number;
  adjustmentPercentage?: number;
  prices: Record<string, number>;
  status?: boolean;
  sku?: string;
  name?: string;
  // Add new properties for variant-specific prices
  customerPrices?: Record<string, {
    rounded: number;
    original: number;
  }>;
  marketplacePrices?: Record<string, {
    rounded: number;
    original: number;
  }>;
}

export interface VolumeDiscountData {
  id: string;
  quantity: number;
  discount_percentage: number;
  global_volume_discount_price_categories: VolumeDiscountPriceCategory[];
  created_at?: string;
  updated_at?: string;
}

export interface VariantVolumeDiscountData {
  id: string;
  variant_id: string;
  variant_name: string;
  variant_sku: string;
  inventory_product_volume_discount_variant_quantities: VariantVolumeDiscountQuantity[];
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VariantVolumeDiscountQuantity {
  id: string;
  quantity: number;
  discount_percentage: number;
  inventory_product_volume_discount_variant_price_categories: VolumeDiscountPriceCategory[];
}

export interface VolumeDiscountPriceCategory {
  id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_type: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
}

// Keep this separate if needed for other forms
export interface ProductFormValues extends PriceFormFields {
  brand: string;
  productTypeId: string;
  categoryId: string;
  sku: string;
  fullProductName: string;
  productName: string;
  unit: "PC" | "PACK" | "SET";
  variants: {
    variant_id: number;
    variant_name: string;
    variant_values: {
      variant_value_id: number;
      variant_value_name: string;
    }[];
  }[];
}