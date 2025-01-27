// Komponen untuk menampilkan dan mengelola form informasi dasar produk
// Mencakup data utama seperti brand, tipe produk, kategori, dan informasi produk lainnya

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  setBrand,
  setProductType,
  selectBrand,
  selectProductType,
  updateForm,
} from "@/lib/store/slices/formInventoryProductSlice";

interface BasicInfoProps {
  form: UseFormReturn<ProductFormValues>; // Menerima instance form dari react-hook-form
}

export function BasicInfo({ form }: Readonly<BasicInfoProps>) {
  const dispatch = useDispatch();
  const [sku, setSku] = useState(form.getValues("sku") || "");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const selectedBrandData = useSelector(selectBrand);
  const selectedProductTypeData = useSelector(selectProductType);
  const uniqueCode = form.watch("uniqueCode");
  const productName = form.watch("productName");

  // Memoize the full product name
  const fullName = useMemo(() => {
    if (
      !selectedBrandData.name ||
      !selectedProductTypeData.name ||
      !productName
    ) {
      return "";
    }
    return `${selectedBrandData.name} ${selectedProductTypeData.name} ${productName}`;
  }, [selectedBrandData.name, selectedProductTypeData.name, productName]);

  // Handle unique code changes
  const handleUniqueCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      form.setValue("uniqueCode", value);
      dispatch(updateForm({ unique_code: value }));
      setLastUpdate(`uniqueCode-${Date.now()}`);
    },
    [dispatch, form]
  );

  // Handler for product name changes
  const handleProductNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, 255); // Limit to 255 characters
      form.setValue("productName", value);
      dispatch(
        updateForm({
          product_name: value,
        })
      );
    },
    [dispatch, form]
  );

  // Handler for vendor SKU changes
  const handleVendorSkuChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      form.setValue("vendorSku", value);
      dispatch(
        updateForm({
          vendor_sku: value,
        })
      );
    },
    [dispatch, form]
  );

  // Handler for description changes
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      form.setValue("description", value);
      dispatch(
        updateForm({
          description: value,
        })
      );
    },
    [dispatch, form]
  );

  // Handler for unit changes
  const handleUnitChange = useCallback(
    (value: string) => {
      form.setValue("unit", value);
      dispatch(
        updateForm({
          unit: value,
        })
      );
    },
    [dispatch, form]
  );

  // Effect for generating SKU and updating Redux
  useEffect(() => {
    if (!selectedBrandData.id || !selectedProductTypeData.id) return;

    const brand = {
      id: selectedBrandData.id,
      code: selectedBrandData.code,
      name: selectedBrandData.name,
    };

    const productType = {
      id: selectedProductTypeData.id,
      code: selectedProductTypeData.code,
      name: selectedProductTypeData.name,
    };

    try {
      const generatedSku = generateSKU(brand, productType, uniqueCode);
      setSku(generatedSku);
      form.setValue("sku", generatedSku);

      // Update Redux store
      dispatch(
        updateForm({
          sku: generatedSku,
          unique_code: uniqueCode || "",
        })
      );
    } catch (error) {
      console.error("Error generating SKU:", error);
    }
  }, [
    selectedBrandData.id,
    selectedProductTypeData.id,
    uniqueCode,
    lastUpdate,
  ]);

  // Effect for full product name and updating Redux
  useEffect(() => {
    if (fullName && sku) {
      const truncatedFullName = fullName.slice(0, 255); // Limit full_product_name to 255
      form.setValue("fullProductName", truncatedFullName);

      // Generate slug from full product name with random number 1-100
      const randomNum = Math.floor(Math.random() * 100) + 1;
      const baseSlug = `${truncatedFullName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${randomNum}-${sku}`;
      // Ensure total slug length including random number doesn't exceed 255
      const maxBaseLength = 250 - String(randomNum).length;
      const truncatedSlug = baseSlug.slice(0, maxBaseLength);
      const slug = `${truncatedSlug}`;

      dispatch(
        updateForm({
          product_name: productName.slice(0, 255),
          full_product_name: truncatedFullName,
          slug,
        })
      );
    }
  }, [fullName, sku, productName, dispatch, form]);

  // Effect untuk memastikan vendor SKU dan description tersimpan di Redux saat komponen mount
  useEffect(() => {
    const initialVendorSku = form.getValues("vendorSku");
    const initialDescription = form.getValues("description");

    if (initialVendorSku || initialDescription) {
      dispatch(
        updateForm({
          vendor_sku: initialVendorSku || "",
          description: initialDescription || "",
        })
      );
    }
  }, []);

  // Effect to initialize unit value in Redux
  useEffect(() => {
    const initialUnit = form.getValues("unit");
    if (initialUnit) {
      dispatch(
        updateForm({
          unit: initialUnit,
        })
      );
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Informations</h3>

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

      <FormField
        control={form.control}
        name="categoryId"
        render={() => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <CategorySelector />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="uniqueCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={handleUniqueCodeChange}
                  placeholder="Enter unique code (optional)"
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
              <Input
                {...field}
                onChange={handleProductNameChange}
                placeholder="Enter product name"
                maxLength={255} // Add maxLength attribute
              />
            </FormControl>
            <FormDescription>Maximum 255 characters</FormDescription>
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
              <Input
                {...field}
                onChange={handleVendorSkuChange}
                onBlur={(e) => {
                  field.onBlur();
                  dispatch(updateForm({ vendor_sku: e.target.value }));
                }}
                placeholder="Enter vendor SKU (optional)"
              />
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
                {...field}
                onChange={handleDescriptionChange}
                onBlur={(e) => {
                  field.onBlur();
                  dispatch(updateForm({ description: e.target.value }));
                }}
                placeholder="Enter product description (optional)"
                className="min-h-[100px] resize-none"
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
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleUnitChange(value);
              }}
              defaultValue={field.value}
            >
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
