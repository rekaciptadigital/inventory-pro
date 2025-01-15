import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { createInventoryProduct, type CreateInventoryData } from '@/lib/api/inventory';

export function useInventoryMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreateInventoryData) => createInventoryProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Product has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create product',
      });
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isLoading: createMutation.isPending,
  };
}