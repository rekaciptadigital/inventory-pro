import axiosInstance from "./axios";

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
    console.error("Error fetching product types:", error);
    throw error;
  }
};

export type ProductTypeFormData = {
  name: string;
  description?: string;
  status?: boolean;
};

export type ProductType = ProductTypeFormData & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function createProductType(
  data: ProductTypeFormData
): Promise<ProductType> {
  // Implement your create logic here
  return {} as ProductType;
}

export async function updateProductType(
  id: string,
  data: ProductTypeFormData
): Promise<ProductType> {
  // Implement your update logic here
  return {} as ProductType;
}

export async function deleteProductType(id: string): Promise<void> {
  // Implement your delete logic here
}

export async function updateProductTypeStatus(
  id: string,
  status: boolean
): Promise<ProductType> {
  // Implement your status update logic here
  return {} as ProductType;
}
