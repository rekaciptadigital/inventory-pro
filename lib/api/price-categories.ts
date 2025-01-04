import axiosInstance from "./axios";
import type { ApiResponse } from "@/types/api";

export interface PriceCategoryFilters {
  search?: string;
  type?: "Customer" | "Ecommerce";
}

export interface PriceCategoryFormData {
  type: "Customer" | "Ecommerce";
  name: string;
  formula: string;
  percentage: number;
  status: boolean;
}

export interface PriceCategory {
  id: number | string; // Update untuk mendukung string ID untuk temporary items
  temp_key?: string; // Tambahkan field untuk React key
  type: "customer" | "ecommerce";
  name: string;
  formula: string;
  percentage: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupedPriceCategories {
  type: string;
  categories: PriceCategory[];
}

export async function getPriceCategories(
  filters: PriceCategoryFilters = {}
): Promise<ApiResponse<GroupedPriceCategories[]>> {
  const params = new URLSearchParams();
  if (filters.search) {
    params.append("search", filters.search);
  }
  if (filters.type) {
    params.append("type", filters.type);
  }

  const response = await axiosInstance.get(
    `/price-categories?${params.toString()}`
  );
  return response.data;
}

export async function createPriceCategory(
  data: PriceCategoryFormData
): Promise<ApiResponse<PriceCategory>> {
  const response = await axiosInstance.post("/price-categories", data);
  return response.data;
}

export async function updatePriceCategory(
  id: string,
  data: PriceCategoryFormData
): Promise<ApiResponse<PriceCategory>> {
  const response = await axiosInstance.put(`/price-categories/${id}`, data);
  return response.data;
}

export async function deletePriceCategory(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/price-categories/${id}`);
  } catch (error) {
    console.error("Error deleting price category:", error);
    throw error; // Re-throw error untuk handling di component
  }
}
