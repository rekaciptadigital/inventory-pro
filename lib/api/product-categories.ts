import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';
import type { ProductCategory } from '@/types/product-category';

export interface ProductCategoryFilters {
  search?: string;
  status?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface ProductCategoryFormData {
  name: string;
  code: string;
  description?: string;
  parent_id?: number | null;
  status: boolean;
}

export async function getProductCategories(
  filters: ProductCategoryFilters = {}
): Promise<ApiResponse<ProductCategory[]>> {
  const params = new URLSearchParams();
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (typeof filters.status === 'boolean') {
    params.append('status', filters.status.toString());
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

  const response = await axiosInstance.get(`/product-categories?${params.toString()}`);
  return response.data;
}

export async function getProductCategory(id: number): Promise<ApiResponse<ProductCategory>> {
  const response = await axiosInstance.get(`/product-categories/${id}`);
  return response.data;
}

export async function createProductCategory(
  data: ProductCategoryFormData
): Promise<ApiResponse<ProductCategory>> {
  const response = await axiosInstance.post('/product-categories', data);
  return response.data;
}

export async function updateProductCategory(
  id: number,
  data: ProductCategoryFormData
): Promise<ApiResponse<ProductCategory>> {
  const response = await axiosInstance.put(`/product-categories/${id}`, data);
  return response.data;
}

export async function deleteProductCategory(id: number): Promise<void> {
  await axiosInstance.delete(`/product-categories/${id}`);
}

export async function updateProductCategoryStatus(
  id: number,
  status: boolean
): Promise<ApiResponse<ProductCategory>> {
  const response = await axiosInstance.patch(`/product-categories/${id}/status`, { status });
  return response.data;
}