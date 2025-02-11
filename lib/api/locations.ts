import axiosInstance from "./axios";

export interface LocationResponse {
  status: {
    code: number;
    message: string;
  };
  data: Array<{
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    code: string;
    name: string;
    type: string;
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

export interface LocationFormData {
  code: string;
  name: string;
  type: "warehouse" | "store" | "affiliate" | "others";
  description?: string;
  status: boolean;
}

interface GetLocationsParams {
  search?: string;
  type?: "warehouse" | "store" | "affiliate" | "others";
  status?: boolean;
  page?: number;
  limit?: number;
}

export const getLocations = async ({
  search = "",
  type = "",
  status,
  page = 1,
  limit = 10,
}: GetLocationsParams = {}) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (type) params.append("type", type);
    if (typeof status === "boolean") params.append("status", status.toString());
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await axiosInstance.get<LocationResponse>(
      `/inventory-locations?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

export const createLocation = async (data: LocationFormData) => {
  const response = await axiosInstance.post("/inventory-locations", data);
  return response.data;
};

export const updateLocation = async (id: number, data: LocationFormData) => {
  const response = await axiosInstance.put(`/inventory-locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id: number) => {
  const response = await axiosInstance.delete(`/inventory-locations/${id}`);
  return response.data;
};

export const updateLocationStatus = async (id: number, status: boolean) => {
  const response = await axiosInstance.patch(
    `/inventory-locations/${id}/status`,
    {
      status,
    }
  );
  return response.data;
};
