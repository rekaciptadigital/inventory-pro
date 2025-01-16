import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { EnhancedSelect, type SelectOption } from '@/components/ui/enhanced-select';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { useProductCategories } from '@/lib/hooks/use-product-categories';
import type { ProductFormValues } from './form-schema';

export function BrandSelector() {
  const { control, formState: { errors } } = useFormContext<ProductFormValues>();
  const { getBrands } = useBrands();

  const loadBrandOptions = useCallback(async (query: string) => {
    const response = await getBrands({ search: query, limit: 10 });
    return (response.data || []).map(brand => ({
      value: brand.id.toString(),
      label: brand.name,
      subLabel: brand.code,
    }));
  }, [getBrands]);

  return (
    <EnhancedSelect
      name="brand"
      control={control}
      isAsync
      onSearch={loadBrandOptions}
      placeholder="Search brands..."
      error={errors.brand?.message}
      subLabel
      classNames={{
        control: () => 'h-10',
        placeholder: () => 'text-sm',
        input: () => 'text-sm',
        option: () => 'text-sm',
      }}
    />
  );
}

export function ProductTypeSelector() {
  const { control, formState: { errors } } = useFormContext<ProductFormValues>();
  const { getProductTypes } = useProductTypes();

  const loadProductTypeOptions = useCallback(async (query: string) => {
    const response = await getProductTypes({ search: query, limit: 10 });
    return response.data.map(type => ({
      value: type.id.toString(),
      label: type.name,
      subLabel: type.code,
    }));
  }, [getProductTypes]);

  return (
    <EnhancedSelect
      name="productTypeId"
      control={control}
      isAsync
      onSearch={loadProductTypeOptions}
      placeholder="Search product types..."
      error={errors.productTypeId?.message}
      subLabel
      classNames={{
        control: () => 'h-10',
        placeholder: () => 'text-sm',
        input: () => 'text-sm',
        option: () => 'text-sm',
      }}
    />
  );
}

export function CategorySelector() {
  const { control, formState: { errors } } = useFormContext<ProductFormValues>();
  const { getCategories } = useProductCategories();

  const loadCategoryOptions = useCallback(async (query: string) => {
    const response = await getCategories({ search: query, limit: 10 });
    return response.data.map(category => ({
      value: category.id.toString(),
      label: category.name,
      subLabel: category.code,
    }));
  }, [getCategories]);

  return (
    <EnhancedSelect
      name="categoryId"
      control={control}
      isAsync
      onSearch={loadCategoryOptions}
      placeholder="Search categories..."
      error={errors.categoryId?.message}
      subLabel
      classNames={{
        control: () => 'h-10',
        placeholder: () => 'text-sm',
        input: () => 'text-sm',
        option: () => 'text-sm',
      }}
    />
  );
}