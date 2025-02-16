import axiosInstance from '../axios';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

export interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export async function updateProfile(data: ProfileUpdateData): Promise<ApiResponse<User>> {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
}

export async function changePassword(data: PasswordChangeData): Promise<ApiResponse<void>> {
  const response = await axiosInstance.put('/users/password', data);
  return response.data;
}