export interface PriceFormFields {
  usdPrice: number;
  exchangeRate: number;
  hbReal: number;
  adjustmentPercentage: number;
  hbNaik: number;
  customerPrices: {
    [key: string]: {
      basePrice: number;
      taxAmount: number;
      taxInclusivePrice: number;
      appliedTaxPercentage: number;
    };
  };
  percentages: {
    [key: string]: number;
  };
  variantPrices?: {
    [key: string]: {
      price: number;
      status: boolean;
    };
  };
}