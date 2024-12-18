import axiosInstance from './axios';
import type { User, UserFormData } from '@/types/user';
import type { ApiResponse } from '@/types/api';

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(filters: UserFilters = {}): Promise<ApiResponse<User[]>> {
  const params = new URLSearchParams();
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  const response = await axiosInstance.get(`/users?${params.toString()}`);
  return response.data;
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
}

export async function createUser(data: UserFormData): Promise<ApiResponse<User>> {
  const response = await axiosInstance.post('/users', data);
  return response.data;
}

export async function updateUser(id: string, data: UserFormData): Promise<ApiResponse<User>> {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
}

export async function patchUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> {
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}