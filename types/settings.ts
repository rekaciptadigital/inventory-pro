export interface PriceCategory {
  id: string;
  type: 'Customer' | 'Ecommerce';
  name: string;
  formula: string;
  percentage: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategorySettings {
  categories: PriceCategory[];
}