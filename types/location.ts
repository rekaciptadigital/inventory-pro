export interface Location {
  id: number;
  code: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LocationFormData {
  code?: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
  status: boolean;
}