// Mengimpor instance axios untuk melakukan request HTTP
import axiosInstance from './axios';
// Mengimpor tipe data yang diperlukan
import type { ApiResponse } from '@/types/api';
import type { Variant, VariantFormData, VariantApiPayload } from '@/types/variant';

// Mendefinisikan interface untuk filter varian
export interface VariantFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Fungsi untuk membuat varian baru
export async function createVariant(data: VariantFormData): Promise<ApiResponse<Variant>> {
  try {
    // Menyiapkan payload untuk request
    const payload: VariantApiPayload = {
      name: data.name,
      display_order: data.displayOrder,
      status: data.status,
      values: data.values
    };

    // Mengirim request POST untuk membuat varian baru
    const response = await axiosInstance.post('/variants', payload);
    return response.data;
  } catch (error: any) {
    // Menangani error validasi
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.join(', '));
    }
    throw error;
  }
}

// Fungsi untuk mendapatkan daftar varian dengan filter
export async function getVariants(filters: VariantFilters = {}): Promise<ApiResponse<Variant[]>> {
  const params = new URLSearchParams();
  // Menambahkan filter ke parameter URL
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

  // Mengirim request GET untuk mendapatkan daftar varian
  const response = await axiosInstance.get(`/variants?${params.toString()}`);
  return response.data;
}

// Fungsi untuk mendapatkan detail varian berdasarkan ID
export async function getVariant(id: string): Promise<ApiResponse<Variant>> {
  // Mengirim request GET untuk mendapatkan detail varian
  const response = await axiosInstance.get(`/variants/${id}`);
  return response.data;
}

// Fungsi untuk memperbarui varian berdasarkan ID
export async function updateVariant(
  id: string,
  data: VariantFormData
): Promise<ApiResponse<Variant>> {
  // Mengirim request PUT untuk memperbarui varian
  const response = await axiosInstance.put(`/variants/${id}`, data);
  return response.data;
}

// Fungsi untuk menghapus varian berdasarkan ID
export async function deleteVariant(id: string): Promise<void> {
  // Mengirim request DELETE untuk menghapus varian
  await axiosInstance.delete(`/variants/${id}`);
}