export interface ProductCategory {
  id: number;
  name: string;
  code?: string;
  description?: string; // Changed from string | null to string | undefined
  status: boolean;
  parent_id?: number;
  children?: ProductCategory[];
  parents?: ProductCategory[];
}
