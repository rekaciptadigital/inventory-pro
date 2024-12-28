import axiosInstance from "./axios";
import type { ProductType } from "@/types/product-type";
import type { ApiResponse } from "@/types/api";

// Interface for filtering product types
export interface ProductTypeFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Interface for product type form data
export interface ProductTypeFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

// Get list of product types with filters
export async function getProductTypes(
  filters: ProductTypeFilters = {}
): Promise<ApiResponse<ProductType[]>> {
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
  if (filters.sort) {
    params.append("sort", filters.sort);
  }
  if (filters.order) {
    params.append("order", filters.order);
  }

  const response = await axiosInstance.get(`/product-types?${params.toString()}`);
  return response.data;
}

// Get single product type by ID
export async function getProductType(id: string): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.get(`/product-types/${id}`);
  return response.data;
}

// Create new product type
export async function createProductType(
  data: ProductTypeFormData
): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.post("/product-types", data);
  return response.data;
}

// Update existing product type
export async function updateProductType(
  id: string,
  data: ProductTypeFormData
): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.put(`/product-types/${id}`, data);
  return response.data;
}

// Delete product type
export async function deleteProductType(id: string): Promise<void> {
  await axiosInstance.delete(`/product-types/${id}`);
}

// Update product type status
export async function updateProductTypeStatus(
  id: string,
  status: boolean
): Promise<ApiResponse<ProductType>> {
  const response = await axiosInstance.patch(`/product-types/${id}/status`, {
    status,
  });
  return response.data;
}