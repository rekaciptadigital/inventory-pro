import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  createTax, 
  updateTax, 
  deleteTax,
  updateTaxStatus 
} from '@/lib/api/taxes';
import type { TaxFormData } from '@/types/tax';

export function useTaxMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: TaxFormData) => createTax(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({
        title: 'Success',
        description: 'Tax has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create tax',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaxFormData }) =>
      updateTax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({
        title: 'Success',
        description: 'Tax has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tax',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({
        title: 'Success',
        description: 'Tax has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete tax',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      updateTaxStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({
        title: 'Success',
        description: 'Tax status has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tax status',
      });
    },
  });

  return {
    createTax: createMutation.mutateAsync,
    updateTax: updateMutation.mutateAsync,
    deleteTax: deleteMutation.mutateAsync,
    updateTaxStatus: updateStatusMutation.mutateAsync,
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending || 
      deleteMutation.isPending ||
      updateStatusMutation.isPending,
  };
}