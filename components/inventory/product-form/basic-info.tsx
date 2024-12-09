'use client';

import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { useBrands } from '@/lib/hooks/use-brands';
import { generateSKU } from '@/lib/utils/sku-generator';

interface BasicInfoProps {
  form: UseFormReturn<ProductFormValues>;
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
  const productName = form.watch('productName');
  const uniqueCode = form.watch('uniqueCode');

  useEffect(() => {
    if (selectedBrand && selectedProductType) {
      const brand = brands.find(b => b.id === selectedBrand);
      const productType = productTypes.find(pt => pt.id === selectedProductType);
      
      if (brand && productType) {
        // Generate SKU
        const sku = generateSKU(brand, productType, uniqueCode);
        form.setValue('sku', sku);

        // Generate full product name
        if (productName) {
          const fullName = `${brand.name} ${productType.name} ${productName}`;
          form.setValue('fullProductName', fullName);
        }
      }
    }
  }, [selectedBrand, selectedProductType, productName, uniqueCode, form, brands, productTypes]);

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
                  onValueChange={field.onChange}
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
              <Select onValueChange={field.onChange} value={field.value}>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="uniqueCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter unique code (optional)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty for auto-generated code
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted" />
              </FormControl>
              <FormDescription>
                Auto-generated based on brand, type, and unique code
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="productName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter product name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fullProductName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Product Name</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormDescription>
              Auto-generated based on brand, product type, and product name
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="vendorSku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor SKU</FormLabel>
            <FormControl>
              <Input placeholder="Enter vendor SKU (optional)" {...field} />
            </FormControl>
            <FormDescription>
              Enter original vendor SKU if available
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
                placeholder="Enter product description (optional)"
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide detailed information about the product
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PC">Piece (PC)</SelectItem>
                <SelectItem value="PACK">Pack</SelectItem>
                <SelectItem value="SET">Set</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}