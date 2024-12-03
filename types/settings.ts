export interface PriceCategory {
  id: string;
  name: string;
  percentage: number;
  order: number;
}

export interface CategorySettings {
  categories: PriceCategory[];
}