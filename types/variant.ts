export interface Variant {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}

export interface VariantFormData {
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}