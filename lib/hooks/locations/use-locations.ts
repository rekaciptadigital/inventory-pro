import { useLocationList } from "./use-location-list";
import { useLocationMutations } from "./use-location-mutations";
import type { GetLocationsParams } from "@/lib/api/locations";
import type { Location } from "@/types/location";

export function useLocations(filters: GetLocationsParams = {}) {
  const { data, isLoading: isLoadingList, error } = useLocationList(filters);
  const mutations = useLocationMutations();

  // Transform the locations array with proper typing
  const locations =
    data?.data?.map((location) => ({
      id: location.id,
      code: location.code,
      name: location.name,
      type: location.type.toLowerCase() as Location["type"],
      description: location.description,
      status: location.status,
      created_at: location.created_at,
      updated_at: location.updated_at,
      deleted_at: location.deleted_at,
    })) ?? [];

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
