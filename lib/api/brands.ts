import axiosInstance from "./axios";
import type { Brand } from "@/types/brand";
import type { ApiResponse } from "@/types/api";

export interface BrandFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BrandFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

export async function getBrands(
  filters: BrandFilters = {}
): Promise<ApiResponse<Brand[]>> {
  const params = new URLSearchParams();
  if (typeof filters.status === "boolean") {
    params.append("status", filters.status.toString());
  }
  if (filters.search) {
    params.append("search", filters.search);
  }
  if (filters.page) {
    params.append("page", filters.page.toString());
  }
  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  const response = await axiosInstance.get(`/brands?${params.toString()}`);
  return response.data;
}

export async function getBrand(id: string): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
}

export async function createBrand(
  data: BrandFormData
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.post("/brands", data);
  return response.data;
}

export async function updateBrand(
  id: string,
  data: BrandFormData
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.put(`/brands/${id}`, data);
  return response.data;
}

export async function deleteBrand(id: string): Promise<void> {
  await axiosInstance.delete(`/brands/${id}`);
}

export async function updateBrandStatus(
  id: string,
  status: boolean
): Promise<ApiResponse<Brand>> {
  const response = await axiosInstance.patch(`/brands/${id}/status`, {
    status,
  });
  return response.data;
}