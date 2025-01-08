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
): Promise<void> {
  try {
    const response = await axiosInstance.put(`/product-categories/${id}`, data);
    if (response.data.status.code === 200) {
      return response.data;
    }
    throw new Error(response.data.error?.[0] || 'Failed to update category');
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error[0]);
    }
    throw new Error('Failed to update category');
  }
}

export async function deleteProductCategory(id: number): Promise<void> {
  try {
    const response = await axiosInstance.delete(`/product-categories/${id}`);
    if (response.data.status.code !== 200) {
      throw new Error(response.data.error?.[0] || 'Failed to delete category');
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error[0]);
    }
    throw new Error('Failed to delete category');
  }
}

export async function updateProductCategoryStatus(
  id: number,
  status: boolean
): Promise<ApiResponse<ProductCategory>> {
  const response = await axiosInstance.patch(`/product-categories/${id}/status`, { status });
  return response.data;
}