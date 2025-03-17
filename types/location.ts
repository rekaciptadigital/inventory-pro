export interface Location {
  id: number;
  code: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
  status: boolean;
  parentId: number | null;
  level: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  children?: Location[];
}

export interface LocationFormData {
  code?: string;
  name: string;
  type: 'warehouse' | 'store' | 'affiliate' | 'others';
  description?: string;
  status: boolean;
  parentId?: number | null;
}

export interface LocationTreeItem extends Location {
  children: LocationTreeItem[];
}