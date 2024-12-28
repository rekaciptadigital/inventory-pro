import axiosInstance from './axios';
import type { VariantType } from '@/types/variant';
import type { ApiResponse } from '@/types/api';

export interface VariantTypeFilters {
  search?: string;
  page?: number;
  limit?: number;
  status?: boolean;
}

export async function getVariantTypes(
  filters: VariantTypeFilters = {}
): Promise<ApiResponse<VariantType[]>> {
  const params = new URLSearchParams();
  
  if (filters.search && filters.search.trim() !== '') {
    params.append('search', filters.search.trim()); // Change back to 'search' from 'name'
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (typeof filters.status === 'boolean') {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.get(`/variants?${params.toString()}`);
  return response.data;
}