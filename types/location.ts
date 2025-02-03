export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  code: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
}