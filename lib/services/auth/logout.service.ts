import { api } from "../api";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { clearAuthData } from "./storage.service";

export async function logoutUser(token?: string): Promise<void> {
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error("Logout failed");
    }

    // Clear local storage after successful API call
    clearAuthData();
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
}
