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
  const { categories, isLoading } = useProductCategories();

  // Flatten nested categories
  const flattenCategories = (categories: any[], parentId: string | null = null): any[] => {
    let result: any[] = [];
    categories.forEach(category => {
      const flatCategory = { ...category };
      if (category.children) {
        result = [...result, ...flattenCategories(category.children, category.id)];
      }
      result.push(flatCategory);
    });
    return result;
  };

  // Get subcategories for a given parent
  const getSubCategories = (parentId: string | null) => {
    const flatCategories = flattenCategories(categories);
    return flatCategories.filter(cat => 
      cat.parent_id?.toString() === parentId?.toString()
    );
  };

  // Check if category has children
  const hasChildren = (categoryId: string | null) => {
    if (!categoryId) return false;
    const category = flattenCategories(categories).find(cat => 
      cat.id.toString() === categoryId.toString()
    );
    return category?.children?.length > 0;
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
                  form.setValue('subCategory1', '');
                  form.setValue('subCategory2', '');
                  form.setValue('subCategory3', '');
                }}
                disabled={isLoading}
                parentId={null}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* First Level Subcategory */}
      {form.watch('categoryId') && hasChildren(form.watch('categoryId')) && (
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
                    form.setValue('subCategory2', '');
                    form.setValue('subCategory3', '');
                  }}
                  disabled={isLoading}
                  parentId={form.watch('categoryId')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Second Level Subcategory */}
      {form.watch('subCategory1') && hasChildren(form.watch('subCategory1')) && (
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
                    form.setValue('subCategory3', '');
                  }}
                  disabled={isLoading}
                  parentId={form.watch('subCategory1')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Third Level Subcategory */}
      {form.watch('subCategory2') && hasChildren(form.watch('subCategory2')) && (
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
                  parentId={form.watch('subCategory2')}
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