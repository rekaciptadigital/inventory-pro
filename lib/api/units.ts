
import { axiosInstance } from './axios-instance';

export async function getUnits(params: {
  search: string;
  page: number;
  limit: number;
}) {
  const response = await axiosInstance.get('/units', {
    params: {
      search: params.search,
      page: params.page,
      limit: params.limit
    }
  });
  return response.data;
}