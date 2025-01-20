// Komponen untuk menampilkan dan mengelola form informasi dasar produk
// Mencakup data utama seperti brand, tipe produk, kategori, dan informasi produk lainnya

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
import {
  BrandSelector,
  ProductTypeSelector,
  CategorySelector,
} from "./enhanced-selectors";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "./form-schema";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypeList } from "@/lib/hooks/product-types/use-product-type-list";
import { generateSKU } from "@/lib/utils/sku-generator";
import { useDispatch } from "react-redux";
import {
  setBrand,
  setProductType,
} from "@/lib/store/slices/formInventoryProductSlice";

interface BasicInfoProps {
  form: UseFormReturn<ProductFormValues>; // Menerima instance form dari react-hook-form
}

export function BasicInfo({ form }: Readonly<BasicInfoProps>) {
  const dispatch = useDispatch();
  const [sku, setSku] = useState(form.getValues("sku") || "");
  const [fullName, setFullName] = useState(
    form.getValues("fullProductName") || ""
  );

  // Watch form values
  const selectedBrand = form.watch("brand");
  const selectedProductType = form.watch("productTypeId");
  const productName = form.watch("productName");
  const uniqueCode = form.watch("uniqueCode");

  // Effect for generating SKU and full product name
  useEffect(() => {
    // Only proceed if we have both brand and product type selected
    if (selectedBrand && selectedProductType) {
      try {
        // Get brand and product type from localStorage
        const savedBrands = localStorage.getItem("brands");
        const savedProductTypes = localStorage.getItem("productTypes");

        const brands = savedBrands ? JSON.parse(savedBrands) : [];
        const productTypes = savedProductTypes
          ? JSON.parse(savedProductTypes)
          : [];

        const brand = brands.find(
          (b: any) => b.id.toString() === selectedBrand
        );
        const productType = productTypes.find(
          (pt: any) => pt.id.toString() === selectedProductType
        );

        if (brand && productType) {
          // Generate SKU
          const generatedSku = generateSKU(brand, productType, uniqueCode);
          setSku(generatedSku);
          form.setValue("sku", generatedSku);

          // Generate full product name only if we have a product name
          if (productName) {
            const generatedFullName = `${brand.name} ${productType.name} ${productName}`;
            setFullName(generatedFullName);
            form.setValue("fullProductName", generatedFullName);
          }
        }
      } catch (error) {
        console.error("Error generating SKU or full name:", error);
      }
    }
  }, [selectedBrand, selectedProductType, productName, uniqueCode, form]);

  // Render form dengan layout grid dan spacing
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
                <BrandSelector />
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
                <ProductTypeSelector />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <CategorySelector />

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
