import axios from 'axios';
import type { User, UserFormData, ApiResponse } from '@/types/user';

const API_URL = 'https://api.proarchery.id/users';

export async function getUsers(page = 1, search = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(search && { search }),
  });

  const response = await axios.get<ApiResponse<User[]>>(
    `${API_URL}?${params.toString()}`
  );
  return response.data;
}

export async function createUser(data: UserFormData) {
  const response = await axios.post<ApiResponse<User>>(API_URL, data);
  return response.data;
}

export async function updateUser(id: string, data: UserFormData) {
  try {
    const response = await axios.put<ApiResponse<User>>(`${API_URL}/${id}`, {
      nip: null,
      nik: null,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      address: null,
      status: data.status
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the error message from the API response
      throw new Error(error.response.data.message || 'Failed to update user');
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  await axios.delete(`${API_URL}/${id}`);
}