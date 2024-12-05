import axios from 'axios';
import type { User, UserFormData, PaginatedResponse } from '@/types/user';

const API_URL = 'http://api.proarchery.id/users';

export async function getUsers(page = 1, search = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(search && { search }),
  });

  const response = await axios.get<PaginatedResponse<User>>(
    `${API_URL}?${params.toString()}`
  );
  return response.data;
}

export async function createUser(data: UserFormData) {
  const response = await axios.post<User>(API_URL, data);
  return response.data;
}

export async function updateUser(id: string, data: UserFormData) {
  const response = await axios.put<User>(`${API_URL}/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string) {
  await axios.delete(`${API_URL}/${id}`);
}