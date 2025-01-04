import axiosInstance from './axios';
import type { PriceCategory } from '@/types/settings';
import type { ApiResponse } from '@/types/api';

export interface PriceCategoryFilters {
  search?: string;
  type?: 'Customer' | 'Ecommerce';
}

export interface PriceCategoryFormData {
  type: 'Customer' | 'Ecommerce';
  name: string;
  formula: string;
  percentage: number;
  status: boolean;
}

export async function getPriceCategories(filters: PriceCategoryFilters = {}): Promise<ApiResponse<PriceCategory[]>> {
  const params = new URLSearchParams();
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.type) {
    params.append('type', filters.type);
  }

  const response = await axiosInstance.get(`/price-categories?${params.toString()}`);
  return response.data;
}

export async function createPriceCategory(data: PriceCategoryFormData): Promise<ApiResponse<PriceCategory>> {
  const response = await axiosInstance.post('/price-categories', data);
  return response.data;
}

export async function updatePriceCategory(id: string, data: PriceCategoryFormData): Promise<ApiResponse<PriceCategory>> {
  const response = await axiosInstance.put(`/price-categories/${id}`, data);
  return response.data;
}

export async function deletePriceCategory(id: string): Promise<void> {
  await axiosInstance.delete(`/price-categories/${id}`);
}