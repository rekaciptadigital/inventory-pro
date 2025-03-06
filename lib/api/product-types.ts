import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';

// Define the missing ProductTypeFilters interface
export interface ProductTypeFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface ProductType {
  id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Get product types with optional filtering
export async function getProductTypes(filters: ProductTypeFilters = {}): Promise<ApiResponse<ProductType[]>> {
  const params = new URLSearchParams();
  
  // Add filters to query params if provided
  if (typeof filters.status === 'boolean') {
    params.append('status', filters.status.toString());
  }
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

  const response = await axiosInstance.get(`/product-types?${params.toString()}`);
  return response.data;
}

// Get single product type by ID
export async function getProductType(id: string): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.get(`/product-types/${id}`);
  return response.data;
}

// Create new product type
export async function createProductType(data: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.post('/product-types', data);
  return response.data;
}

// Update existing product type
export async function updateProductType(id: string, data: Partial<Omit<ProductType, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.put(`/product-types/${id}`, data);
  return response.data;
}

// Delete product type
export async function deleteProductType(id: string): Promise<void> {
  await axiosInstance.delete(`/product-types/${id}`);
}