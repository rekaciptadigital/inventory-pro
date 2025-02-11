import { useQuery } from '@tanstack/react-query';
import { getLocations, type GetLocationsParams } from '@/lib/api/locations';

export function useLocationList(filters: GetLocationsParams = {}) {
  return useQuery({
    queryKey: ['locations', filters],
    queryFn: () => getLocations(filters),
    keepPreviousData: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}