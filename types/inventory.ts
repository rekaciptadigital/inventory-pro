export interface Product {
  id: string;
  brand: string;
  sku: string;
  productName: string;
  unit: 'Pcs' | 'PACK' | 'SET';
  hbReal: number;
  adjustmentPercentage: number;
  usdPrice: number;
  exchangeRate: number;
  hbNaik: number;
  multipliers: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  quantities: {
    min15: number;
    min10: number;
    min5: number;
    single: number;
    retail: number;
  };
  customerCategories: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
}

export interface ProductFormData extends Omit<Product, 'id'> {}