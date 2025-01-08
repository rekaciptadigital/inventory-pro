import axiosInstance from "./axios";
import type { ApiResponse } from "@/types/api";
import type { ProductCategory } from "@/types/product-category";

export interface ProductCategoryFilters {
  search?: string;
  status?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface ProductCategoryFormData {
  name: string;
  description?: string;
  parent_id?: number | null;
  status: boolean;
}

export interface UpdateProductCategoryData {
  name: string;
  description: string;
  status: boolean;
}

export const getProductCategories = async (
  filters: ProductCategoryFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (typeof filters.status === "boolean")
    params.append("status", filters.status.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.order) params.append("order", filters.order);

  const response = await axiosInstance.get(
    `/product-categories?${params.toString()}`
  );
  return response.data;
};

export const getProductCategory = async (id: number) => {
  const response = await axiosInstance.get(`/product-categories/${id}`);
  return response.data;
};

export const createProductCategory = async (data: ProductCategoryFormData) => {
  const response = await axiosInstance.post("/product-categories", data);
  return response.data;
};

export const updateProductCategory = async (
  id: number,
  data: UpdateProductCategoryData
) => {
  const response = await axiosInstance.put(`/product-categories/${id}`, data);
  return response.data;
};

export const deleteProductCategory = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/product-categories/${id}`);
    if (response.data.status.code !== 200) {
      throw new Error(response.data.error?.[0] || "Failed to delete category");
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error[0]);
    }
    throw new Error("Failed to delete category");
  }
};

export const updateProductCategoryStatus = async (
  id: number,
  status: boolean
) => {
  const response = await axiosInstance.patch(
    `/product-categories/${id}/status`,
    { status }
  );
  return response.data;
};
