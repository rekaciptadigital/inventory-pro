// Komponen untuk menampilkan form pemilihan kategori bertingkat (dinamis)
// Dapat menampilkan hingga 3 level sub-kategori berdasarkan struktur data

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

  // Fungsi utilitas untuk meratakan struktur kategori nested
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

  // Fungsi untuk mengecek keberadaan sub-kategori
  const hasChildren = (categoryId: string | undefined | null): boolean => {
    if (!categoryId) return false;
    const category = flattenCategories(categories).find(cat => 
      cat.id.toString() === categoryId.toString()
    );
    return category?.children?.length > 0;
  };

  // Helper function untuk menghitung jumlah field yang aktif
  const getActiveFieldCount = () => {
    let count = 1; // Main category selalu ada
    if (form.watch('categoryId') && hasChildren(form.watch('categoryId'))) count++;
    if (form.watch('subCategory1') && hasChildren(form.watch('subCategory1'))) count++;
    if (form.watch('subCategory2') && hasChildren(form.watch('subCategory2'))) count++;
    return count;
  };

  const activeFields = getActiveFieldCount();
  const fieldWidth = `${100 / activeFields}%`; // Distribusi lebar yang sama

  // Render form kategori bertingkat
  // Setiap level akan muncul jika parent-nya memiliki sub-kategori
  return (
    <div className="flex items-start gap-4 w-full">
      {/* Kategori Utama */}
      <div style={{ width: fieldWidth }}>
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
      </div>

      {/* Sub Kategori Level 1 */}
      {form.watch('categoryId') && hasChildren(form.watch('categoryId')) && (
        <div style={{ width: fieldWidth }}>
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
        </div>
      )}

      {/* Sub Kategori Level 2 */}
      {form.watch('subCategory1') && hasChildren(form.watch('subCategory1')) && (
        <div style={{ width: fieldWidth }}>
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
        </div>
      )}

      {/* Sub Kategori Level 3 */}
      {form.watch('subCategory2') && hasChildren(form.watch('subCategory2')) && (
        <div style={{ width: fieldWidth }}>
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
        </div>
      )}
    </div>
  );
}