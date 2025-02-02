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
  variantPrices?: Record<string, {
    price: number;
    status: boolean;
  }>;
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