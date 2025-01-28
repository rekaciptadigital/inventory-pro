import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  createProductType,
  updateProductType,
  deleteProductType,
  updateProductTypeStatus,
} from "@/lib/api/product-types";
import type { ProductTypeFormData } from "@/lib/api/product-types";

export function useProductTypeMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: ProductTypeFormData) => createProductType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      toast({
        title: "Success",
        description: "Product type has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create product type",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductTypeFormData }) =>
      updateProductType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      toast({
        title: "Success",
        description: "Product type has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product type",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      toast({
        title: "Success",
        description: "Product type has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete product type",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      updateProductTypeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      toast({
        title: "Success",
        description: "Product type status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update product type status",
      });
    },
  });

  return {
    createProductType: createMutation.mutateAsync,
    updateProductType: updateMutation.mutateAsync,
    deleteProductType: deleteMutation.mutateAsync,
    updateProductTypeStatus: updateStatusMutation.mutateAsync,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      updateStatusMutation.isPending,
  };
}
