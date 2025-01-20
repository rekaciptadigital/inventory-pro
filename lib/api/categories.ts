import axiosInstance from "./axios";

export interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  name: string;
  code: string;
  description: string;
  parent_id: number | null;
  status: boolean;
  children: Category[];
}

export interface CategoryResponse {
  status: {
    code: number;
    message: string;
  };
  data: Category[];
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

export const getCategories = async ({
  search = "",
  page = 1,
  limit = 10,
  sort = "created_at",
  order = "DESC",
} = {}) => {
  try {
    const response = await axiosInstance.get<CategoryResponse>(
      "/product-categories",
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
    console.error("Error fetching categories:", error);
    throw error;
  }
};
