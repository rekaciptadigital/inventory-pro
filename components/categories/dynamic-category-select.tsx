import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useProductCategories } from '@/lib/hooks/use-product-categories';
import { ProductCategorySelect } from './product-category-select';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/components/inventory/product-form/form-schema';

interface DynamicCategorySelectProps {
  form: UseFormReturn<ProductFormValues>;
}

export function DynamicCategorySelect({ form }: DynamicCategorySelectProps) {
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const { categories, isLoading } = useProductCategories();

  // Find category and its children by ID
  const findCategory = (id: string) => {
    const findInCategories = (cats: any[]): any => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children?.length) {
          const found = findInCategories(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInCategories(categories);
  };

  // Update category path when main category changes
  useEffect(() => {
    const mainCategoryId = form.watch('categoryId');
    if (mainCategoryId) {
      const newPath = [mainCategoryId];
      let currentCat = findCategory(mainCategoryId);
      
      // Reset all subcategory fields
      form.setValue('subCategory1', '');
      form.setValue('subCategory2', '');
      form.setValue('subCategory3', '');
      
      setCategoryPath(newPath);
    } else {
      setCategoryPath([]);
    }
  }, [form.watch('categoryId')]);

  // Update path when subcategories change
  useEffect(() => {
    const sub1 = form.watch('subCategory1');
    const sub2 = form.watch('subCategory2');
    const sub3 = form.watch('subCategory3');

    const newPath = [form.watch('categoryId')];
    if (sub1) newPath.push(sub1);
    if (sub2) newPath.push(sub2);
    if (sub3) newPath.push(sub3);

    setCategoryPath(newPath);
  }, [
    form.watch('categoryId'),
    form.watch('subCategory1'),
    form.watch('subCategory2'),
    form.watch('subCategory3'),
  ]);

  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    const parent = findCategory(parentId);
    return parent?.children || [];
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Main Category</FormLabel>
            <FormControl>
              <ProductCategorySelect
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset subcategories when main category changes
                  form.setValue('subCategory1', '');
                  form.setValue('subCategory2', '');
                  form.setValue('subCategory3', '');
                }}
                disabled={isLoading}
                parentId={null} // Only show top-level categories
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* First Level Subcategory */}
      {categoryPath[0] && getSubcategories(categoryPath[0]).length > 0 && (
        <FormField
          control={form.control}
          name="subCategory1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Category</FormLabel>
              <FormControl>
                <ProductCategorySelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset lower level subcategories
                    form.setValue('subCategory2', '');
                    form.setValue('subCategory3', '');
                  }}
                  disabled={isLoading}
                  parentId={categoryPath[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Second Level Subcategory */}
      {categoryPath[1] && getSubcategories(categoryPath[1]).length > 0 && (
        <FormField
          control={form.control}
          name="subCategory2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Category 2</FormLabel>
              <FormControl>
                <ProductCategorySelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset lower level subcategory
                    form.setValue('subCategory3', '');
                  }}
                  disabled={isLoading}
                  parentId={categoryPath[1]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Third Level Subcategory */}
      {categoryPath[2] && getSubcategories(categoryPath[2]).length > 0 && (
        <FormField
          control={form.control}
          name="subCategory3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Category 3</FormLabel>
              <FormControl>
                <ProductCategorySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                  parentId={categoryPath[2]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}