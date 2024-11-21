export interface PriceCategory {
  id: string;
  name: string;
  multiplier: number;
  order: number;
}

export interface CategorySettings {
  categories: PriceCategory[];
}