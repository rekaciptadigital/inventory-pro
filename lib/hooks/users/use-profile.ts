import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  updateProfile, 
  changePassword, 
  type ProfileUpdateData, 
  type PasswordChangeData 
} from '@/lib/api/users/profile';
import { useAuth } from '@/lib/hooks/use-auth';

export function useProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    try {
      setIsUpdating(true);
      
      // Check for user before proceeding
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You must be logged in to update your profile',
        });
        throw new Error('User not authenticated');
      }

      if (!user.id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User ID not found',
        });
        throw new Error('User ID not found');
      }
      
      // Make sure we're passing a string ID, not an object
      const userId = String(user.id);
      
      // Update the profile with proper ID as string
      await updateProfile(userId, {
        ...data,
        email: user.email,
      });
      
      // Call refreshUser without storing the unused result
      await refreshUser();

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update profile',
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