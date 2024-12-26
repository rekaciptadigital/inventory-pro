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
  unit: "PC" | "PACK" | "SET";
  createdAt: string;
  updatedAt: string;
  basePrice: number;
  stock: number;
}

export interface ProductFormData extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}

export type ProductFormValues = {
  brand: string;
  sku: string;
  productName: string;
  fullProductName?: string;
  productTypeId: string;
  unit: string;
  description?: string;
  basePrice: number;
  stock: number;
};