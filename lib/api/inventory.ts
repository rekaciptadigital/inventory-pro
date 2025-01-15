import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';
import type { InventoryProduct } from '@/types/inventory';

export interface CreateInventoryData {
  brand_id: string;
  brand_code: string;
  brand_name: string;
  product_type_id: string;
  product_type_code: string;
  product_type_name: string;
  unique_code: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  vendor_sku: string;
  description: string;
  unit: string;
  slug: string;
  categories: Array<{
    product_category_id: string;
    product_category_parent: string | null;
    product_category_name: string;
    category_hierarchy: number;
  }>;
  variants: Array<{
    variant_id: string;
    variant_name: string;
    variant_values: Array<{
      variant_value_id: string;
      variant_value_name: string;
    }>;
  }>;
  product_by_variant: Array<{
    full_product_name: string;
    sku: string;
    sku_product_unique_code: string;
  }>;
}

export interface InventoryFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export async function getInventoryProducts(
  filters: InventoryFilters = {}
): Promise<ApiResponse<InventoryProduct[]>> {
  const params = new URLSearchParams();
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }
  if (filters.order) {
    params.append('order', filters.order);
  }

  const response = await axiosInstance.get(`/inventory?${params.toString()}`);
  return response.data;
}

export async function createInventoryProduct(
  data: CreateInventoryData
): Promise<ApiResponse<InventoryProduct>> {
  const response = await axiosInstance.post('/inventory', data);
  return response.data;
}