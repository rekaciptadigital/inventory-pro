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

export interface GetLocationsParams {
  search?: string;
  type?: "warehouse" | "store" | "affiliate" | "others";
  status?: boolean;
  page?: number;
  limit?: number;
}

export const getLocations = async ({
  search = "",
  type,
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

interface CreateLocationResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    id: number;
    code: string;
    name: string;
    type: string;
    description: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
}

export const createLocation = async (data: LocationFormData) => {
  try {
    const response = await axiosInstance.post<CreateLocationResponse>(
      "/inventory-locations",
      {
        ...data,
        type: data.type.charAt(0).toUpperCase() + data.type.slice(1) // Capitalize first letter
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

interface UpdateLocationResponse {
  status: {
    code: number;
    message: string;
  };
  data: [{
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    code: string;
    name: string;
    type: string;
    description: string;
    status: boolean;
  }];
}

export const updateLocation = async (id: number, data: LocationFormData) => {
  try {
    const response = await axiosInstance.put<UpdateLocationResponse>(
      `/inventory-locations/${id}`,
      {
        ...data,
        type: data.type.charAt(0).toUpperCase() + data.type.slice(1) // Capitalize first letter
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
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
