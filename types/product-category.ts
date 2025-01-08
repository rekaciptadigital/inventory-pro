export interface ProductCategory {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  code: string;
  description: string | null;
  parent_id: number | null;
  status: boolean;
  children: ProductCategory[];
  parent?: ProductCategory; // Add this for direct parent
  parents?: ProductCategory[]; // Add this for parent hierarchy
}
