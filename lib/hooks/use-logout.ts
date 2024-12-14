"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { logoutUser } from "@/lib/services/auth/logout.service";

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();
  const { tokens, logout: authLogout } = useAuth();

  const logout = async () => {
    try {
      // Clear auth state & hit api logout from service
      authLogout();

      // Show success message
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
      throw error;
    }
  };

  return { logout };
}
