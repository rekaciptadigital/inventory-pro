'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { ProductSearchSelect } from '@/components/inventory/product-search/product-search-select';
import { UseFormReturn } from 'react-hook-form';
import { VariantFormValues } from './variant-form-schema';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { useBrands } from '@/lib/hooks/use-brands';

interface BasicInfoProps {
  form: UseFormReturn<VariantFormValues>;
}

export function BasicInfo({ form }: BasicInfoProps) {
  const { productTypes } = useProductTypes();
  const { brands } = useBrands();
  
  const brandOptions = brands.map(brand => ({
    label: brand.name,
    value: brand.id,
  }));

  const selectedBrand = form.watch('brand');
  const selectedProductType = form.watch('productTypeId');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
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
                    // Reset product selection when brand changes
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
                  // Reset product selection when type changes
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
                onValueChange={field.onChange}
                disabled={!selectedBrand || !selectedProductType}
              />
            </FormControl>
            <FormDescription>
              Select a product to create variants for. Only products matching the selected brand and type will be shown.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter variant description (optional)"
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide additional details about these variants
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}