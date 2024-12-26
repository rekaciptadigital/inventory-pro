import type { Product } from './inventory';

export type ProductFormValues = Omit<Product, 
  | 'id' 
  | 'exchangeRate'
  | 'customerPrices'
  | 'percentages'
  | 'createdAt'
  | 'updatedAt'
> & {
  unit: string;
};
