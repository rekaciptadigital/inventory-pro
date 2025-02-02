import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInventoryMutations } from './use-inventory-mutations';
import { getInventoryProduct, deleteInventoryProduct, getInventoryProducts } from '@/lib/api/inventory';
import type { InventoryFilters } from '@/lib/api/inventory';
import { useToast } from '@/components/ui/use-toast';

export function useInventory(filters: InventoryFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data, 
    isLoading: isLoadingList, 
    error 
  } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => getInventoryProducts(filters),
  });

  const mutations = useInventoryMutations();

  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteInventoryProduct(id);
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Product has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getInventoryProduct(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    getProduct,
    deleteProduct,
    ...mutations,
  };
}