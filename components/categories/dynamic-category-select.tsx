// Komponen ini menangani tampilan form kategori yang dinamis
// Dapat menampilkan hingga 3 level sub-kategori secara otomatis
// berdasarkan struktur data kategori yang tersedia

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useProductCategories } from '@/lib/hooks/use-product-categories';
import { ProductCategorySelect } from './product-category-select';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/components/inventory/product-form/form-schema';

interface DynamicCategorySelectProps {
  form: Readonly<UseFormReturn<ProductFormValues>>;
}

export function DynamicCategorySelect({ form }: Readonly<DynamicCategorySelectProps>) {
  const { categories, isLoading } = useProductCategories();

  // Fungsi untuk meratakan struktur kategori nested
  // Mempertahankan informasi parent_id untuk relasi antar kategori
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

  // Fungsi untuk mengecek apakah suatu kategori memiliki sub-kategori
  // Digunakan untuk menentukan apakah perlu menampilkan level selanjutnya
  const hasChildren = (categoryId: string | undefined | null): boolean => {
    if (!categoryId) return false;
    const category = flattenCategories(categories).find(cat => 
      cat.id.toString() === categoryId.toString()
    );
    return category?.children?.length > 0;
  };

  return (
    <div className="space-y-4">
      {/* Kategori Utama */}
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

      {/* Sub Kategori Level 1 
          Muncul jika kategori utama terpilih dan memiliki sub-kategori */}
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

      {/* Sub Kategori Level 2
          Muncul jika sub-kategori level 1 terpilih dan memiliki sub-kategori */}
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

      {/* Sub Kategori Level 3
          Muncul jika sub-kategori level 2 terpilih dan memiliki sub-kategori */}
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