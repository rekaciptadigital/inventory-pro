// Mengimpor instance axios dan tipe data yang diperlukan
import axiosInstance from "./axios";
import type { Brand } from "@/types/brand";
import type { ApiResponse } from "@/types/api";

// Mendefinisikan interface untuk filter brand
export interface BrandFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Mendefinisikan interface untuk data form brand
export interface BrandFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

// Fungsi untuk mendapatkan daftar brand dengan filter
export async function getBrands(
  filters: BrandFilters = {}
): Promise<ApiResponse<Brand[]>> {
  const params = new URLSearchParams();
  // Menambahkan filter status ke parameter jika ada
  if (typeof filters.status === "boolean") {
    params.append("status", filters.status.toString());
  }
  // Menambahkan filter pencarian ke parameter jika ada
  if (filters.search) {
    params.append("search", filters.search);
  }
  // Menambahkan filter halaman ke parameter jika ada
  if (filters.page) {
    params.append("page", filters.page.toString());
  }
  // Menambahkan filter limit ke parameter jika ada
  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  // Mengirim permintaan GET ke endpoint /brands dengan parameter yang telah ditentukan
  const response = await axiosInstance.get(`/brands?${params.toString()}`);
  return response.data;
}

// Fungsi untuk mendapatkan detail brand berdasarkan ID
export async function getBrand(id: string): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
}

// Fungsi untuk membuat brand baru
export async function createBrand(
  data: BrandFormData
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.post("/brands", data);
  return response.data;
}

// Fungsi untuk memperbarui brand berdasarkan ID
export async function updateBrand(
  id: string,
  data: BrandFormData
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.put(`/brands/${id}`, data);
  return response.data;
}

// Fungsi untuk menghapus brand berdasarkan ID
export async function deleteBrand(id: string): Promise<void> {
  await axiosInstance.delete(`/brands/${id}`);
}

// Fungsi untuk memperbarui status brand berdasarkan ID
export async function updateBrandStatus(
  id: string,
  status: boolean
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.patch(`/brands/${id}/status`, {
    status,
  });
  return response.data;
}