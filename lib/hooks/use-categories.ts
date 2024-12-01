'use client';

import { useState, useEffect } from 'react';
import { buildCategoryTree, flattenCategoryTree } from '@/lib/utils/category-utils';
import type { Category, CategoryFormData, CategoryTreeItem } from '@/types/category';
import { generateSlug } from '@/lib/utils/slug';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      setCategories(parsedCategories);
      setCategoryTree(buildCategoryTree(parsedCategories));
    }
  }, []);

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
        // Validate unique name within the same level
        const siblings = categories.filter(cat => 
          cat.parentId === data.parentId && cat.id !== id
        );
        if (siblings.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
          throw new Error('A category with this name already exists at this level');
        }

        // Prevent circular reference
        if (id === data.parentId) {
          throw new Error('A category cannot be its own parent');
        }

        // Check if new parent is not a descendant
        const isDescendant = (parentId: string | null, targetId: string): boolean => {
          if (!parentId) return false;
          const parent = categories.find(cat => cat.id === parentId);
          if (!parent) return false;
          if (parent.id === targetId) return true;
          return isDescendant(parent.parentId, targetId);
        };

        if (data.parentId && isDescendant(data.parentId, id)) {
          throw new Error('Cannot move a category to its own descendant');
        }

        // Calculate new level
        const level = data.parentId 
          ? (categories.find(cat => cat.id === data.parentId)?.level || 0) + 1
          : 0;

        const updatedCategories = categories.map(category => {
          if (category.id === id) {
            return {
              ...category,
              name: data.name,
              slug: generateSlug(data.name),
              description: data.description,
              status: data.status,
              parentId: data.parentId,
              level,
              updatedAt: new Date().toISOString(),
            };
          }
          return category;
        });

        // Update levels of all descendants
        const updateDescendantLevels = (parentId: string, parentLevel: number) => {
          const children = updatedCategories.filter(cat => cat.parentId === parentId);
          children.forEach(child => {
            const childIndex = updatedCategories.findIndex(cat => cat.id === child.id);
            updatedCategories[childIndex] = {
              ...child,
              level: parentLevel + 1,
            };
            updateDescendantLevels(child.id, parentLevel + 1);
          });
        };

        updateDescendantLevels(id, level);
        saveCategories(updatedCategories);
        resolve(updatedCategories.find(cat => cat.id === id)!);
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteCategory = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Get all descendant categories
        const getDescendants = (categoryId: string): string[] => {
          const children = categories.filter(cat => cat.parentId === categoryId);
          return [
            categoryId,
            ...children.flatMap(child => getDescendants(child.id)),
          ];
        };

        const categoriesToDelete = getDescendants(id);
        const updatedCategories = categories.filter(
          category => !categoriesToDelete.includes(category.id)
        );

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

        saveCategories(updatedCategories);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    categories,
    categoryTree,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
  };
}