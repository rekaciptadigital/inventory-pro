import axios from 'axios';
import { API_URL } from '@/lib/api/constants';
import { getTokens } from '@/lib/services/auth/storage.service';
import { type ProfileUpdateData } from '@/lib/api/users/profile';

// ...existing code...

export const updateUserProfile = async (userId: string, data: ProfileUpdateData) => {
  const tokens = getTokens();
  
  const response = await axios.put(`${API_URL}/users/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${tokens?.access_token}`,
    }
  });
  return response.data;
};

// ...existing code...
