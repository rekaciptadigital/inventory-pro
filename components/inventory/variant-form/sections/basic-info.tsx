'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductSearchSelect } from '@/components/inventory/product-search/product-search-select';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProducts } from '@/lib/hooks/use-products';
import { VariantFormValues } from '../variant-form-schema';

interface BasicInfoProps {
  form: UseFormReturn<VariantFormValues>;
}

export function BasicInfo({ form }: BasicInfoProps) {
  const { productTypes } = useProductTypes();
  const { brands } = useBrands();
  const { getProductById } = useProducts();
  
  const brandOptions = brands.map(brand => ({
    label: brand.name,
    value: brand.id,
  }));

  const selectedBrand = form.watch('brand');
  const selectedProductType = form.watch('productTypeId');

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Combobox
                  options={brandOptions}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('productId', '');
                  }}
                  placeholder="Search and select brand"
                  emptyText="No brands found. Please add a brand first."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('productId', '');
                }} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="productId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <FormControl>
              <ProductSearchSelect
                brandId={selectedBrand}
                productTypeId={selectedProductType}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const product = getProductById(value);
                  if (product) {
                    form.setValue('baseSku', product.sku);
                  }
                }}
                disabled={!selectedBrand || !selectedProductType}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="baseSku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base SKU</FormLabel>
            <FormControl>
              <Input
                {...field}
                readOnly
                disabled
                className="bg-muted"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}