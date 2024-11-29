export interface ProductType {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTypeFormData {
  name: string;
  code: string;
}