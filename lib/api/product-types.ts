import axiosInstance from "./axios";
import axios, { AxiosError } from 'axios';

export interface ProductTypeResponse {
  status: {
    code: number;
    message: string;
  };
  data: Array<{
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    name: string;
    code: string;
    description: string;
    status: boolean;
  }>;
  pagination: {
    links: {
      first: string;
      previous: string | null;
      current: string;
      next: string | null;
      last: string;
    };
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface GetProductTypesParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export const getProductTypes = async ({
  search = "",
  page = 1,
  limit = 10,
  sort = "created_at",
  order = "desc",
}: GetProductTypesParams = {}) => {
  try {
    const response = await axiosInstance.get<ProductTypeResponse>(
      "/product-types",
      {
        params: {
          search,
          page,
          limit,
          sort,
          order,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (!axiosError.response) {
        console.error('Network Error: Unable to connect to the server');
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      console.error('Error fetching product types:', {
        status: axiosError.response?.status,
        message: axiosError.message,
      });
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

export interface ProductTypeFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

export async function createProductType(data: ProductTypeFormData) {
  const response = await axiosInstance.post("/product-types", data);
  return response.data;
}

export async function updateProductType(id: string, data: ProductTypeFormData) {
  const response = await axiosInstance.put(`/product-types/${id}`, data);
  return response.data;
}

export async function deleteProductType(id: string) {
  const response = await axiosInstance.delete(`/product-types/${id}`);
  return response.data;
}

export async function updateProductTypeStatus(id: string, status: boolean) {
  const response = await axiosInstance.patch(`/product-types/${id}/status`, {
    status,
  });
  return response.data;
}