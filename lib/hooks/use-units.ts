import { useState, useCallback } from 'react';
import { getUnits } from '@/lib/api/units';

export function useUnits() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnits = useCallback(async (params: {
    search: string;
    page: number;
    limit: number;
  }) => {
    setIsLoading(true);
    try {
      const response = await getUnits(params);
      return response;
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchUnits,
    isLoading
  };
}
