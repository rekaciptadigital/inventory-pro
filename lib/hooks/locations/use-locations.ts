import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Location, LocationFormData } from '@/types/location';

interface UseLocationsOptions {
  search?: string;
  type?: string;
}

export function useLocations(options: UseLocationsOptions = {}) {
  const [locations, setLocations] = useState<Location[]>(() => {
    // Initialize with some mock data
    const mockLocations: Location[] = [
      {
        id: '1',
        code: 'WH-001',
        name: 'Central Warehouse',
        type: 'warehouse',
        description: 'Main storage facility',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        code: 'ST-001',
        name: 'Downtown Store',
        type: 'store',
        description: 'Retail location in city center',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ];
    return mockLocations;
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredLocations = locations.filter(location => {
    const matchesSearch = options.search
      ? location.name.toLowerCase().includes(options.search.toLowerCase()) ||
        location.code.toLowerCase().includes(options.search.toLowerCase())
      : true;

    const matchesType = options.type && options.type !== 'all'
      ? location.type === options.type
      : true;

    return matchesSearch && matchesType;
  });

  const createLocation = async (data: LocationFormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      const newLocation: Location = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLocations(prev => [...prev, newLocation]);
      toast({
        title: 'Success',
        description: 'Location has been created successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create location',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async ({ id, data }: { id: string; data: LocationFormData }): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      setLocations(prev =>
        prev.map(location =>
          location.id === id
            ? {
                ...location,
                ...data,
                updated_at: new Date().toISOString(),
              }
            : location
        )
      );
      toast({
        title: 'Success',
        description: 'Location has been updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update location',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      setLocations(prev => prev.filter(location => location.id !== id));
      toast({
        title: 'Success',
        description: 'Location has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete location',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locations: filteredLocations,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}