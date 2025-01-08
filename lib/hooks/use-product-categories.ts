import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  updateProductCategoryStatus,
  type ProductCategoryFilters,
  type ProductCategoryFormData,
} from '@/lib/api/product-categories';

export function useProductCategories(filters: ProductCategoryFilters = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['productCategories', filters],
    queryFn: () => getProductCategories(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductCategoryFormData) => createProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({
        title: 'Success',
        description: 'Category has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create category',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductCategoryFormData }) =>
      updateProductCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({
        title: 'Success',
        description: 'Category has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update category',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({
        title: 'Success',
        description: 'Category has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete category',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: boolean }) =>
      updateProductCategoryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({
        title: 'Success',
        description: 'Category status has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update category status',
      });
    },
  });

  return {
    categories: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    updateCategoryStatus: updateStatusMutation.mutateAsync,
  };
}