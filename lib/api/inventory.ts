import axios from "axios"; // Add this import for the isAxiosError method
import axiosInstance from "./axios";
import type { ApiResponse } from "@/types/api";
import type { InventoryProduct } from "@/types/inventory";

export async function getInventoryProduct(id: string): Promise<ApiResponse<InventoryProduct>> {
  const response = await axiosInstance.get(`/inventory/${id}`);
  return response.data;
}

export interface CreateInventoryData {
  brand_id: number;
  brand_code: string;
  brand_name: string;
  product_type_id: number;
  product_type_code: string;
  product_type_name: string;
  unique_code: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  vendor_sku?: string;
  description?: string;
  unit: string;
  slug: string;
  categories: Array<{
    product_category_id: number;
    product_category_parent: number | null;
    product_category_name: string;
    category_hierarchy: number;
  }>;
  variants: Array<{
    variant_id: number;
    variant_name: string;
    variant_values: Array<{
      variant_value_id: number;
      variant_value_name: string;
    }>;
  }>;
  product_by_variant: Array<{
    id?: string; // Optional for create, required for update
    full_product_name: string;
    sku_product_variant: string; // Changed from sku to sku_product_variant
    sku_product_unique_code: string;
    sku_vendor?: string | null; // Match API field name
    status: boolean; // Always include status
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

export async function handleInventoryProduct(
  data: CreateInventoryData,
  id?: string
): Promise<InventoryProduct> {
  try {
    const isUpdate = Boolean(id);
    const endpoint = isUpdate ? `/inventory/${id}` : '/inventory';
    const method = isUpdate ? 'put' : 'post';
    
    const response = await axiosInstance({
      method,
      url: endpoint,
      data,
      validateStatus: (status) => 
        isUpdate ? status === 200 : status === 201
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {  // Use axios instead of axiosInstance
      const message = error.response?.data?.message || error.message;
      throw new Error(`Inventory API Error: ${message}`);
    }
    throw error;
  }
}

// Convenience wrappers for type safety
export const createInventoryProduct = (data: CreateInventoryData) => 
  handleInventoryProduct(data);

export const updateInventoryProduct = (id: string, data: CreateInventoryData) => 
  handleInventoryProduct(data, id);

export async function deleteInventoryProduct(id: number): Promise<void> {
  try {
    const response = await axiosInstance.delete(`/inventory/${id}`);
    if (response.status !== 200) {
      throw new Error('Failed to delete product');
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete product';
    throw new Error(message);
  }
}