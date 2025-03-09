export interface PriceFormFields {
  // Basic price fields
  usdPrice: number;
  exchangeRate: number;
  hbReal: number;
  adjustmentPercentage: number;
  hbNaik: number;
  
  // Customer prices and percentages
  customerPrices: Record<string, {
    basePrice: number;
    taxAmount: number;
    taxInclusivePrice: number;
    appliedTaxPercentage: number;
  }>;
  percentages: Record<string, number>;
  
  // Variant prices
  variantPrices: Record<string, {
    prices: Record<string, number>;
    usdPrice: number;
    adjustmentPercentage: number;
    status: boolean;
  }>;
  
  // Add marketplace prices
  marketplacePrices: Record<string, {
    basePrice: number;
    taxAmount: number;
    taxInclusivePrice: number;
    appliedTaxPercentage: number;
  }>;
  
  // Add marketplace percentages
  marketplacePercentages: Record<string, number>;
  
  pricingInformation: {
    usdPrice: number;
    adjustmentPercentage: number;
    // Add any other fields that might be in the pricing information
  };

  defaultPriceCategoryId: string;
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