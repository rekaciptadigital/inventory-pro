import axiosInstance from "./axios";

export interface BrandResponse {
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

export interface BrandFormData {
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

interface GetBrandsParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC"; // Update type to use uppercase
}

export const getBrands = async ({
  search = "",
  page = 1,
  limit = 10,
  sort = "created_at",
  order = "DESC", // Set default to uppercase
}: GetBrandsParams = {}) => {
  try {
    const response = await axiosInstance.get<BrandResponse>("/brands", {
      params: {
        search,
        page,
        limit,
        sort,
        order,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

export const createBrand = async (data: BrandFormData) => {
  const response = await axiosInstance.post("/brands", data);
  return response.data;
};

export const updateBrand = async (id: number, data: BrandFormData) => {
  const response = await axiosInstance.put(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: number) => {
  const response = await axiosInstance.delete(`/brands/${id}`);
  return response.data;
};

export const updateBrandStatus = async (id: number, status: boolean) => {
  const response = await axiosInstance.patch(`/brands/${id}/status`, {
    status,
  });
  return response.data;
};
