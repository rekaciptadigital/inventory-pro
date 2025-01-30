import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { buildCategoryTree, flattenCategoryTree } from '@/lib/utils/category-utils';
import { 
  getProductCategories,
  updateProductCategory,
  deleteProductCategory,
  type ProductCategory,
  type ProductCategoryFormData
} from '@/lib/api/product-categories';
import { generateSlug } from '@/lib/utils/slug';

export function useCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getProductCategories();
      setCategories(response.data);
      setCategoryTree(buildCategoryTree(response.data));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (data: ProductCategoryFormData) => {
    try {
      setIsLoading(true);
      // Validate unique name within the same level
      const siblings = categories.filter(cat => cat.parent_id === data.parent_id);
      if (siblings.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
        throw new Error('A category with this name already exists at this level');
      }

      // Create new category
      const response = await getProductCategories();
      await fetchCategories(); // Refresh categories after adding
      return response.data[0];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add category';
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, data: ProductCategoryFormData) => {
    try {
      setIsLoading(true);
      await updateProductCategory(id, data);
      await fetchCategories(); // Refresh categories after update
      return categories.find(cat => cat.id === id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update category"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteProductCategory(id);
      await fetchCategories(); // Refresh categories after deletion
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete category"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    categoryTree,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  };
}