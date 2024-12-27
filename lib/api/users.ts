// Mengimpor instance axios untuk melakukan permintaan HTTP
import axiosInstance from './axios';
// Mengimpor tipe data User dan UserFormData dari folder types
import type { User, UserFormData } from '@/types/user';
// Mengimpor tipe data ApiResponse dari folder types
import type { ApiResponse } from '@/types/api';

// Mendefinisikan interface untuk filter pengguna
export interface UserFilters {
  search?: string; // Filter pencarian
  page?: number;   // Filter halaman
  limit?: number;  // Filter batas jumlah data per halaman
}

// Fungsi untuk mendapatkan daftar pengguna dengan filter
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

  // Melakukan permintaan GET ke endpoint /users dengan parameter yang telah ditentukan
  const response = await axiosInstance.get(`/users?${params.toString()}`);
  return response.data;
}

// Fungsi untuk mendapatkan detail pengguna berdasarkan ID
export async function getUser(id: string): Promise<ApiResponse<User>> {
  // Melakukan permintaan GET ke endpoint /users/{id}
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
}

// Fungsi untuk membuat pengguna baru
export async function createUser(data: UserFormData): Promise<ApiResponse<User>> {
  // Melakukan permintaan POST ke endpoint /users dengan data pengguna baru
  const response = await axiosInstance.post('/users', data);
  return response.data;
}

// Fungsi untuk memperbarui data pengguna berdasarkan ID
export async function updateUser(id: string, data: UserFormData): Promise<ApiResponse<User>> {
  // Melakukan permintaan PUT ke endpoint /users/{id} dengan data yang diperbarui
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
}

// Fungsi untuk memperbarui sebagian data pengguna berdasarkan ID
export async function patchUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> {
  // Melakukan permintaan PATCH ke endpoint /users/{id} dengan data yang diperbarui sebagian
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
}

// Fungsi untuk menghapus pengguna berdasarkan ID
export async function deleteUser(id: string): Promise<void> {
  // Melakukan permintaan DELETE ke endpoint /users/{id}
  await axiosInstance.delete(`/users/${id}`);
}