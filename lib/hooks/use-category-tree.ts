import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api/categories';

export function useCategoryTree() {
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        const response = await getCategories({
          search: "",
          page: 1,
          limit: 100,
        });
        setCategoryTree(response.data);
      } catch (error) {
        console.error("Error loading category tree:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryTree();
  }, []);

  return { categoryTree, isLoading };
}
