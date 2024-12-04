export interface Product {
  id: string;
  brand: string;
  productTypeId: string;
  sku: string;
  vendorSku?: string;
  productName: string;
  unit: 'PC' | 'PACK' | 'SET';
  hbReal: number;
  adjustmentPercentage: number;
  hbNaik: number;
  usdPrice: number;
  exchangeRate: number;
  quantities: {
    min15: number;
    min10: number;
    min5: number;
    single: number;
    retail: number;
  };
  customerPrices: {
    [key: string]: {
      basePrice: number;
      taxInclusivePrice: number;
      appliedTaxPercentage: number;
    };
  };
  variants?: Array<{
    typeId: string;
    values: string[];
  }>;
}

export interface ProductFormData extends Omit<Product, 'id' | 'hbNaik'> {}