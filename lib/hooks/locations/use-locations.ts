import { useLocationList } from "./use-location-list";
import { useLocationMutations } from "./use-location-mutations";
import type { GetLocationsParams } from "@/lib/api/locations";
import type { Location } from "@/types/location";

// Helper function to transform location data recursively
const transformLocation = (location: any): Location => {
  return {
    id: location.id,
    code: location.code,
    name: location.name,
    type: location.type.toLowerCase() as Location["type"],
    description: location.description,
    status: location.status,
    parentId: location.parent_id,
    level: location.level || 0,
    created_at: location.created_at,
    updated_at: location.updated_at,
    deleted_at: location.deleted_at,
    children: location.children?.map(transformLocation) || [],
  };
};

export function useLocations(filters: GetLocationsParams = {}) {
  const { data, isLoading: isLoadingList, error } = useLocationList(filters);
  const mutations = useLocationMutations();

  // Transform the locations array with proper typing
  const locations = data?.data?.map(transformLocation) ?? [];

  return {
    locations,
    pagination: data?.pagination,
    isLoading: isLoadingList || mutations.isLoading,
    error,
    createLocation: mutations.createLocation,
    updateLocation: mutations.updateLocation,
    deleteLocation: mutations.deleteLocation,
    updateLocationStatus: mutations.updateLocationStatus,
  };
}
