export interface Product {
  id: string;
  brand: string;
  productTypeId: string;
  sku: string;
  vendorSku?: string;
  productName: string;
  fullProductName?: string;
  description?: string;
  usdPrice: number;
  exchangeRate: number;
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
  variants?: Array<{
    typeId: string;
    values: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}