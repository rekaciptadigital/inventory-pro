import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  createVariant, 
  updateVariant, 
  deleteVariant,
} from '@/lib/api/variants';
import type { VariantFormData } from '@/types/variant';

export function useVariantMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      queryClient.invalidateQueries(['variants']);
      toast({
        title: "Success",
        description: "Variant created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VariantFormData }) =>
      updateVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast({
        title: 'Success',
        description: 'Variant has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update variant',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast({
        title: 'Success',
        description: 'Variant has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete variant',
      });
    },
  });

  return {
    createVariant: createMutation.mutateAsync,
    updateVariant: updateMutation.mutateAsync,
    deleteVariant: deleteMutation.mutateAsync,
    isLoading: 
      createMutation.isLoading || 
      updateMutation.isPending || 
      deleteMutation.isPending,
  };
}