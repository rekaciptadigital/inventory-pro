export interface PriceCategory {
  name: string;
  percentage: number;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  status: 'active' | 'inactive';
}

export interface CustomerPrice {
  basePrice: number;
  taxAmount: number;
  taxInclusivePrice: number;
  appliedTaxPercentage: number;
}

export interface CustomerPrices {
  [key: string]: CustomerPrice;
}