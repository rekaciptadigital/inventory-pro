import axios from 'axios';
import { API_URL } from '@/lib/api/constants';
import { getTokens } from '@/lib/services/auth/storage.service';

export type ProfileUpdateData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string | null;
  photo_profile?: string | null;
};

export type PasswordChangeData = {
  current_password: string;
  new_password: string;
};

export const updateProfile = async (userId: string, data: ProfileUpdateData) => {
  const tokens = getTokens();
  
  const response = await axios.put(`${API_URL}/users/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${tokens?.access_token}`,
    },
  });
  return response.data;
};

export const changePassword = async (data: PasswordChangeData) => {
  const tokens = getTokens();
  
  const response = await axios.post(`${API_URL}/auth/change-password`, data, {
    headers: {
      Authorization: `Bearer ${tokens?.access_token}`,
    },
  });
  return response.data;
};

export const getUserDetails = async (userId: string) => {
  const tokens = getTokens();
  
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${tokens?.access_token}`,
    },
  });
  return response.data;
};