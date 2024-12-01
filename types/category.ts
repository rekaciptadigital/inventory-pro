export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  parentId: string | null;
  level: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  parentId: string | null;
}

export interface CategoryTreeItem extends Category {
  children: CategoryTreeItem[];
}