import axiosInstance from '../axios';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

export interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string;
  photo_profile?: string | null;
  // Keep other fields in case they're needed elsewhere
  nip?: string | null;
  nik?: string | null;
  address?: string | null;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

/**
 * Get user details by ID
 */
export async function getUserDetails(userId: string): Promise<ApiResponse<User>> {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
}

// No need to change the function signature itself, just add some validation
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<ApiResponse<User>> {
  // Add validation to catch errors early
  if (!userId || typeof userId !== 'string') {
    console.error("Invalid userId provided to updateProfile:", userId);
    throw new Error(`Invalid user ID: ${String(userId)}`);
  }
  
  console.log(`Making API request to /users/${userId} with data:`, data);
  const response = await axiosInstance.put(`/users/${userId}`, data);
  return response.data;
}

// Keep the password change endpoint as is
export async function changePassword(data: PasswordChangeData): Promise<ApiResponse<void>> {
  const response = await axiosInstance.put('/users/password', data);
  return response.data;
}