import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  createPriceCategory, 
  updatePriceCategory, 
  deletePriceCategory,
} from '@/lib/api/price-categories';
import type { PriceCategoryFormData } from '@/lib/api/price-categories';

export function usePriceCategoryMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: PriceCategoryFormData) => createPriceCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceCategories'] });
      toast({
        title: 'Success',
        description: 'Price category has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create price category',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PriceCategoryFormData }) =>
      updatePriceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceCategories'] });
      toast({
        title: 'Success',
        description: 'Price category has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update price category',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePriceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceCategories'] });
      toast({
        title: 'Success',
        description: 'Price category has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete price category',
      });
    },
  });

  return {
    createPriceCategory: createMutation.mutateAsync,
    updatePriceCategory: updateMutation.mutateAsync,
    deletePriceCategory: deleteMutation.mutateAsync,
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending || 
      deleteMutation.isPending,
  };
}