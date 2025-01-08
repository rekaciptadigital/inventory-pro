'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { buildCategoryTree, flattenCategoryTree } from '@/lib/utils/category-utils';
import { 
  getProductCategories,
  updateProductCategory,
  deleteProductCategory
} from '@/lib/api/product-categories';
import type { Category, CategoryFormData, CategoryTreeItem } from '@/types/category';
import { generateSlug } from '@/lib/utils/slug';

export function useCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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
        description: "Failed to fetch categories",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const saveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    setCategoryTree(buildCategoryTree(updatedCategories));
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const addCategory = async (data: CategoryFormData): Promise<Category> => {
    return new Promise((resolve, reject) => {
      try {
        // Validate unique name within the same level
        const siblings = categories.filter(cat => cat.parentId === data.parentId);
        if (siblings.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
          throw new Error('A category with this name already exists at this level');
        }

        // Calculate level
        const level = data.parentId 
          ? (categories.find(cat => cat.id === data.parentId)?.level || 0) + 1
          : 0;

        // Calculate order
        const order = siblings.length;

        // Create new category
        const newCategory: Category = {
          id: Date.now().toString(),
          name: data.name,
          slug: generateSlug(data.name),
          description: data.description,
          status: data.status,
          parentId: data.parentId,
          level,
          order,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedCategories = [...categories, newCategory];
        saveCategories(updatedCategories);
        resolve(newCategory);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateCategory = async (id: string, data: CategoryFormData): Promise<Category> => {
    return new Promise((resolve, reject) => {
      try {
        const siblings = categories.filter(cat => 
          cat.parentId === data.parentId && cat.id !== id
        await updateProductCategory(Number(id), data);
        await fetchCategories();
        resolve(categories.find(cat => cat.id === id)!);
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteCategory = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        saveCategories(updatedCategories);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const reorderCategory = async (
    categoryId: string,
    newParentId: string | null,
    newOrder: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) {
          throw new Error('Category not found');
        }

        // Update category parent and order
        const updatedCategories = categories.map(cat => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              parentId: newParentId,
              order: newOrder,
              updatedAt: new Date().toISOString(),
            };
          }
          return cat;
        });

        // Reorder siblings
        const siblings = updatedCategories.filter(
          cat => cat.parentId === newParentId && cat.id !== categoryId
        );
        siblings.forEach((sibling, index) => {
          const siblingIndex = updatedCategories.findIndex(cat => cat.id === sibling.id);
          if (index >= newOrder) {
            updatedCategories[siblingIndex] = {
              ...sibling,
              order: index + 1,
            };
          }
        });

        await deleteProductCategory(Number(id));
        await fetchCategories();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    categories,
    categoryTree,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
  };
}