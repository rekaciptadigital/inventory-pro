"use client";

import React, { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { BrandSearchSelect } from "@/components/brands/brand-search-select";
import { ProductTypeSearchSelect } from "@/components/product-types/product-type-search-select";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "./form-schema";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypeList } from "@/lib/hooks/product-types/use-product-type-list";
import { generateSKU } from "@/lib/utils/sku-generator";

interface BasicInfoProps {
  form: UseFormReturn<ProductFormValues>;
}

export function BasicInfo({ form }: BasicInfoProps) {
  const { brands } = useBrands();
  const { data: productTypesData, isLoading: isLoadingProductTypes } =
    useProductTypeList();
  const productTypes = productTypesData?.data ?? [];

  const brandOptions = brands.map((brand) => ({
    label: brand.name,
    value: brand.id.toString(), // Convert value to string
  }));

  const selectedBrand = form.watch("brand");
  const selectedProductType = form.watch("productTypeId");
  const productName = form.watch("productName");
  const uniqueCode = form.watch("uniqueCode");

  const [sku, setSku] = useState(form.getValues("sku") || "");
  const [fullName, setFullName] = useState(
    form.getValues("fullProductName") || ""
  );

  useEffect(() => {
    if (selectedBrand && selectedProductType) {
      const brand = brands.find((b) => b.id.toString() === selectedBrand); // Ensure comparison is correct
      const productType = productTypes.find(
        (pt) => pt.id.toString() === selectedProductType
      ); // Updated to match string comparison

      if (brand && productType) {
        // Generate SKU
        const generatedSku = generateSKU(brand, productType, uniqueCode);
        setSku(generatedSku);
        form.setValue("sku", generatedSku);

        // Generate full product name
        if (productName) {
          const generatedFullName = `${brand.name} ${productType.name} ${productName}`;
          setFullName(generatedFullName);
          form.setValue("fullProductName", generatedFullName);
        }
      }
    }
  }, [
    selectedBrand,
    selectedProductType,
    productName,
    uniqueCode,
    form,
    brands,
    productTypes,
  ]);

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
                <BrandSearchSelect
                  value={field.value}
                  onValueChange={field.onChange}
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
              <FormControl>
                <ProductTypeSearchSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
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
                <Input placeholder="Enter unique code (optional)" {...field} />
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
                <Input {...field} readOnly className="bg-muted" value={sku} />
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
              <Input
                {...field}
                readOnly
                className="bg-muted"
                value={fullName}
              />
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
