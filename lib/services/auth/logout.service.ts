import axios from '@/lib/api/axios';

export async function logoutUser(token?: string): Promise<void> {
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    await axios.post('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout API error:', error);
    throw new Error('Failed to logout');
  }
}