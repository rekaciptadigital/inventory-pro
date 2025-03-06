import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  updateProfile, 
  changePassword, 
  getUserDetails, 
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
        console.error("Cannot update profile - user not authenticated");
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You must be logged in to update your profile',
        });
        throw new Error('User not authenticated');
      }

      if (!user.id) {
        console.error("User object exists but has no ID");
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User ID not found',
        });
        throw new Error('User ID not found');
      }
      
      // Log the exact values we're passing
      console.log("Updating profile for user ID:", user.id, "with data:", data);
      
      // Make sure we're passing a string ID, not an object
      const userId = String(user.id);
      
      // Update the profile with proper ID as string
      await updateProfile(userId, {
        ...data,
        email: user.email,
      });
      
      // Use refreshUser to get the latest user data
      const refreshSuccess = await refreshUser();
      console.log("Profile updated and user refreshed:", refreshSuccess);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error("Profile update failed:", error);
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