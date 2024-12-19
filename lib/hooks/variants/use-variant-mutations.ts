import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  createVariantType, 
  updateVariantType, 
  deleteVariantType 
} from '@/lib/api/variants';
import type { VariantTypeFormData } from '@/types/variant';

export function useVariantMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: VariantTypeFormData) => createVariantType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast({
        title: 'Success',
        description: 'Variant type has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create variant type',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VariantTypeFormData }) =>
      updateVariantType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast({
        title: 'Success',
        description: 'Variant type has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update variant type',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVariantType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast({
        title: 'Success',
        description: 'Variant type has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete variant type',
      });
    },
  });

  return {
    createVariantType: createMutation.mutateAsync,
    updateVariantType: updateMutation.mutateAsync,
    deleteVariantType: deleteMutation.mutateAsync,
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending || 
      deleteMutation.isPending,
  };
}