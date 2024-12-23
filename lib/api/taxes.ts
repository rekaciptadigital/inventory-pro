import axiosInstance from './axios';
import type { Tax } from '@/types/tax';
import type { ApiResponse } from '@/types/api';

export interface TaxFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaxFormData {
  name: string;
  description?: string;
  percentage: number;
  status: 'active' | 'inactive';
}

export async function getTaxes(filters: TaxFilters = {}): Promise<ApiResponse<Tax[]>> {
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

  const response = await axiosInstance.get(`/taxes?${params.toString()}`);
  return response.data;
}

export async function getTax(id: string): Promise<ApiResponse<Tax>> {
  const response = await axiosInstance.get(`/taxes/${id}`);
  return response.data;
}

export async function createTax(data: TaxFormData): Promise<ApiResponse<Tax>> {
  const response = await axiosInstance.post('/taxes', data);
  return response.data;
}

export async function updateTax(id: string, data: TaxFormData): Promise<ApiResponse<Tax>> {
  const response = await axiosInstance.put(`/taxes/${id}`, data);
  return response.data;
}

export async function deleteTax(id: string): Promise<void> {
  await axiosInstance.delete(`/taxes/${id}`);
}

export async function updateTaxStatus(id: string, status: boolean): Promise<ApiResponse<Tax>> {
  const response = await axiosInstance.patch(`/taxes/${id}/status`, { status });
  return response.data;
}