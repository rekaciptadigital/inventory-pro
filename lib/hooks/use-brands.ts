import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
  type BrandFilters,
  type BrandFormData,
} from "@/lib/api/brands";
import type { Brand } from "@/types/brand";

export function useBrands(filters: BrandFilters = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query for fetching brands
  const {
    data,
    isLoading: isLoadingBrands,
    error,
  } = useQuery({
    queryKey: ["brands", filters],
    queryFn: () => getBrands(filters),
  });

  // Mutation for creating a brand
  const createMutation = useMutation({
    mutationFn: (brandData: BrandFormData) => createBrand(brandData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create brand",
      });
    },
  });

  // Mutation for updating a brand
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandFormData }) =>
      updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update brand",
      });
    },
  });

  // Mutation for deleting a brand
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete brand",
      });
    },
  });

  // Mutation for updating brand status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      updateBrandStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update brand status",
      });
    },
  });

  return {
    brands: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingBrands || isLoading,
    error,
    createBrand: createMutation.mutateAsync,
    updateBrand: updateMutation.mutateAsync,
    deleteBrand: deleteMutation.mutateAsync,
    updateBrandStatus: async (id: string, status: boolean) => {
      return updateStatusMutation.mutateAsync({ id, status });
    },
  };
}
