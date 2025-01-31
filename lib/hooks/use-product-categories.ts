'use client';

// Custom hook untuk manajemen state dan operasi kategori produk
// Menggunakan React Query untuk state management dan caching
// Menyediakan fungsi-fungsi CRUD dengan penanganan loading state dan error

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  updateProductCategoryStatus,
  getProductCategory,
  type ProductCategoryFilters,
  type ProductCategoryFormData,
  type UpdateProductCategoryData,
} from "@/lib/api/product-categories";
import type { ProductCategory } from "@/types/product-category";

// Interface untuk kategori dengan parent
interface CategoryWithParent extends ProductCategory {
  parent?: CategoryWithParent;
}

export function useProductCategories(filters: ProductCategoryFilters = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query untuk mengambil data kategori
  // Menggunakan React Query untuk caching dan auto-refetch
  const { data, isLoading, error } = useQuery({
    queryKey: ["productCategories", filters],
    queryFn: () => getProductCategories(filters),
  });

  // Mutation untuk membuat kategori baru
  // Menangani success/error state dan toast notifications
  const createMutation = useMutation({
    mutationFn: (data: ProductCategoryFormData) => createProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
      toast({
        title: "Success",
        description: "Category has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create category",
      });
    },
  });

  // Mutation untuk mengupdate kategori
  // Menerima id dan data kategori yang akan diupdate
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductCategoryData }) =>
      updateProductCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
      toast({
        title: "Success",
        description: "Category has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update category",
      });
    },
  });

  // Mutation untuk menghapus kategori
  // Menangani konfirmasi dan error handling
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
      toast({
        title: "Success",
        description: "Category has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete category",
      });
    },
  });

  // Mutation untuk mengupdate status kategori
  // Mengubah status aktif/nonaktif
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: boolean }) =>
      updateProductCategoryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
      toast({
        title: "Success",
        description: "Category status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update category status",
      });
    },
  });

  // Fungsi helper untuk mendapatkan hierarki parent
  // Mencari semua parent kategori secara rekursif
  const getParentHierarchy = (category: CategoryWithParent): ProductCategory[] => {
    const hierarchy: ProductCategory[] = [];
    let current = category.parent;

    while (current) {
      hierarchy.unshift(current);
      current = current.parent;
    }

    return hierarchy;
  };

  // Fungsi untuk mengambil detail kategori
  // Mentransformasi response untuk include parent hierarchy
  const getCategory = async (id: number) => {
    try {
      const response = await getProductCategory(id);
      if (response.status.code === 200) {
        // Transform response to include parents array
        const category = response.data;
        const parentHierarchy = getParentHierarchy(category);

        return {
          ...response,
          data: {
            ...category,
            parents: parentHierarchy,
          },
        };
      }
      throw new Error("Failed to fetch category details");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch category details",
      });
      throw error;
    }
  };

  return {
    categories: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    updateCategoryStatus: updateStatusMutation.mutateAsync,
    getCategory,
  };
}
