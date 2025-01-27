import axiosInstance from "./axios";
import type { ApiResponse } from "@/types/api";
import type { InventoryProduct } from "@/types/inventory";

export interface CreateInventoryData {
  brand_id: string;
  brand_code: string;
  brand_name: string;
  product_type_id: string;
  product_type_code: string;
  product_type_name: string;
  unique_code: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  unit: string;
  slug: string;
  categories: Array<{
    product_category_id: string;
    product_category_parent: string | null;
    product_category_name: string;
    category_hierarchy: number;
  }>;
  vendor_sku?: string; // Optional
  description?: string; // Optional
  variants?: Array<{
    // Optional
    variant_id: string;
    variant_name: string;
    variant_values: Array<{
      variant_value_id: string;
      variant_value_name: string;
    }>;
  }>;
  product_by_variant?: Array<{
    // Optional
    full_product_name: string;
    sku: string;
    sku_product_unique_code: string;
  }>;
}

export interface InventoryFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

interface InventoryApiErrorResponse {
  status: {
    code: number;
    message: string;
  };
  error: string[];
}

interface InventoryApiSuccessResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    // ...other fields match with your response
  };
}

export async function getInventoryProducts(
  filters: InventoryFilters = {}
): Promise<ApiResponse<InventoryProduct[]>> {
  const params = new URLSearchParams();

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

  const response = await axiosInstance.get(`/inventory?${params.toString()}`);
  return response.data;
}

export async function createInventoryProduct(
  data: CreateInventoryData
): Promise<InventoryApiSuccessResponse> {
  try {
    const response = await axiosInstance.post("/inventory", data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const errorResponse = error.response.data as InventoryApiErrorResponse;
      throw new Error(errorResponse.error.join("\n"));
    }
    throw error;
  }
}
