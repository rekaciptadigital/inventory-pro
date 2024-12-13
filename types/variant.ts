export interface VariantType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
  updatedAt: string;
  values: VariantValue[];
}

export interface VariantValue {
  id: string;
  name: string;
  details?: string;
  order: number;
  variantTypeId: string;
}

export interface VariantTypeFormData {
  name: string;
  status: 'active' | 'inactive';
  order: number;
  values: Omit<VariantValue, 'id' | 'variantTypeId'>[];
}