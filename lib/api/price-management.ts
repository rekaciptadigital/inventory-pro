import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';
import type { InventoryProduct } from '@/types/inventory';

export interface PriceManagementFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export async function getPriceManagementProducts(
  filters: PriceManagementFilters = {}
): Promise<ApiResponse<InventoryProduct[]>> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.order) params.append('order', filters.order);

  const response = await axiosInstance.get(`/inventory?${params.toString()}`);
  return response.data;
}