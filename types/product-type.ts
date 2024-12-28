export interface ProductType {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTypeFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}