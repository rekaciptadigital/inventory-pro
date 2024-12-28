import axiosInstance from "./axios";
import type { ProductType } from "@/types/product-type";
import type { ApiResponse } from "@/types/api";

export interface ProductTypeFilters {
  status?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

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