export interface VariantType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
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
  values: Omit<VariantValue, 'id' | 'variantTypeId'>[];
}