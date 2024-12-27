// Mengimpor instance axios untuk melakukan permintaan HTTP
import axiosInstance from './axios';
// Mengimpor tipe data Tax dan ApiResponse dari folder types
import type { Tax } from '@/types/tax';
import type { ApiResponse } from '@/types/api';

// Mendefinisikan interface untuk filter pajak
export interface TaxFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Mendefinisikan interface untuk data formulir pajak
export interface TaxFormData {
  name: string;
  description?: string;
  percentage: number;
  status: 'active' | 'inactive';
}

// Fungsi untuk mendapatkan daftar pajak dengan filter
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

  // Melakukan permintaan GET ke endpoint /taxes dengan parameter yang telah ditentukan
  const response = await axiosInstance.get(`/taxes?${params.toString()}`);
  return response.data;
}

// Fungsi untuk mendapatkan detail pajak berdasarkan ID
export async function getTax(id: string): Promise<ApiResponse<Tax>> {
  // Melakukan permintaan GET ke endpoint /taxes/{id}
  const response = await axiosInstance.get(`/taxes/${id}`);
  return response.data;
}

// Fungsi untuk membuat pajak baru
export async function createTax(data: TaxFormData): Promise<ApiResponse<Tax>> {
  // Melakukan permintaan POST ke endpoint /taxes dengan data formulir pajak
  const response = await axiosInstance.post('/taxes', data);
  return response.data;
}

// Fungsi untuk memperbarui pajak berdasarkan ID
export async function updateTax(id: string, data: TaxFormData): Promise<ApiResponse<Tax>> {
  // Melakukan permintaan PUT ke endpoint /taxes/{id} dengan data formulir pajak
  const response = await axiosInstance.put(`/taxes/${id}`, data);
  return response.data;
}

// Fungsi untuk menghapus pajak berdasarkan ID
export async function deleteTax(id: string): Promise<void> {
  // Melakukan permintaan DELETE ke endpoint /taxes/{id}
  await axiosInstance.delete(`/taxes/${id}`);
}

// Fungsi untuk memperbarui status pajak berdasarkan ID
export async function updateTaxStatus(id: string, status: boolean): Promise<ApiResponse<Tax>> {
  // Melakukan permintaan PATCH ke endpoint /taxes/{id}/status dengan status baru
  const response = await axiosInstance.patch(`/taxes/${id}/status`, { status });
  return response.data;
}