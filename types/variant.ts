export interface VariantFormData {
  name: string;
  displayOrder: number;
  status: boolean;
  values: string[];
}

export interface VariantApiPayload {
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}

export interface Variant {
  id: number;
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export async function createVariant(data: VariantFormData): Promise<ApiResponse<Variant>> {
  try {
    const response = await axiosInstance.post('/variants', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.join(', '));
    }
    throw error;
  }
}