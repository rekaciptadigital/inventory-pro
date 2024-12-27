import axiosInstance from './axios';
import type { VariantType } from '@/types/variant';
import type { ApiResponse } from '@/types/api';

/**
 * Interface untuk parameter filtering tipe varian
 * Digunakan untuk mengirim query parameter ke API
 */
export interface VariantTypeFilters {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fungsi untuk mengambil data tipe varian dari API
 * Mengirim request GET dengan parameter filter yang diberikan
 * @param filters - Parameter filtering opsional
 * @returns Promise dengan response data tipe varian
 */
export async function getVariantTypes(filters: VariantTypeFilters = {}): Promise<ApiResponse<VariantType[]>> {
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

  const response = await axiosInstance.get(`/variants?${params.toString()}`);
  return response.data;
}