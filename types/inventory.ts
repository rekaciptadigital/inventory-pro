export interface Product {
  id: string;
  brand: string;
  productTypeId: string;  // Added product type reference
  sku: string;
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
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
}

export interface ProductFormData extends Omit<Product, 'id' | 'hbNaik'> {}