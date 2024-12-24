import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';
import type { Variant } from '@/types/variant';

export interface VariantFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface VariantFormData {
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}

export async function createVariant(data: VariantFormData): Promise<ApiResponse<Variant>> {
  try {
    const response = await axiosInstance.post('/variants', data);
    return response.data;
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.join(', '));
    }
    throw error;
  }
}

export async function getVariants(filters: VariantFilters = {}): Promise<ApiResponse<Variant[]>> {
  const params = new URLSearchParams();
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

  const response = await axiosInstance.get(`/variants?${params.toString()}`);
  return response.data;
}

export async function getVariant(id: string): Promise<ApiResponse<Variant>> {
  const response = await axiosInstance.get(`/variants/${id}`);
  return response.data;
}

export async function updateVariant(
  id: string,
  data: VariantFormData
): Promise<ApiResponse<Variant>> {
  const response = await axiosInstance.put(`/variants/${id}`, data);
  return response.data;
}

export async function deleteVariant(id: string): Promise<void> {
  await axiosInstance.delete(`/variants/${id}`);
}