export interface Tax {
  id: string;
  name: string;
  description?: string;
  percentage: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TaxFormData {
  name: string;
  description?: string;
  percentage: number;
  status: 'active' | 'inactive';
}