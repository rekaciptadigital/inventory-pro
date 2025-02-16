import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile, changePassword, type ProfileUpdateData, type PasswordChangeData } from '@/lib/api/users/profile';
import { useAuth } from '@/lib/hooks/use-auth';

export function useProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user, initializeAuth } = useAuth();

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    try {
      setIsUpdating(true);
      const response = await updateProfile(data);
      
      // Update auth context with new user data
      if (user) {
        initializeAuth({
          user: response.data,
          tokens: { // Keep existing tokens
            access_token: user.tokens.access_token,
            refresh_token: user.tokens.refresh_token,
            expires_in: user.tokens.expires_in,
          }
        });
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeData) => {
    try {
      setIsUpdating(true);
      await changePassword(data);
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile: handleProfileUpdate,
    changePassword: handlePasswordChange,
    isUpdating,
  };
}