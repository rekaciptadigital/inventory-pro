"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { BasicInfo } from "./basic-info";
import { VariantCombinations } from "./variant-combinations"; // Import VariantCombinations
import { productFormSchema, type ProductFormValues } from "./form-schema";
import { generateSKU } from "@/lib/utils/sku-generator";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypeList } from "@/lib/hooks/product-types/use-product-type-list";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  createInventoryProduct,
  CreateInventoryData,
} from "@/lib/api/inventory";

interface SingleProductFormProps {
  onSuccess?: (product: ProductFormValues) => void;
  onClose?: () => void;
  initialData?: ProductFormValues;
}

const defaultValues: ProductFormValues = {
  brand: "",
  productTypeId: "",
  sku: "",
  uniqueCode: "",
  fullProductName: "",
  productName: "",
  description: "",
  vendorSku: "",
  unit: "PC",
};

export function SingleProductForm({
  onSuccess,
  onClose,
  initialData,
}: Readonly<SingleProductFormProps>) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { brands } = useBrands();
  const { data: productTypesData, isLoading: isLoadingProductTypes } =
    useProductTypeList();
  const productTypes = productTypesData?.data ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ?? defaultValues,
    mode: "onChange",
  });

  // Add selector for form data from Redux
  const formData = useSelector(
    (state: RootState) => state.formInventoryProduct
  );

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert numeric IDs to strings as required by API
      const inventoryData: CreateInventoryData = {
        brand_id: formData.brand_id,
        brand_code: formData.brand_code || "",
        brand_name: formData.brand_name || "",
        product_type_id: formData.product_type_id,
        product_type_code: formData.product_type_code || "",
        product_type_name: formData.product_type_name || "",
        unique_code: formData.unique_code || "",
        sku: formData.sku || "",
        product_name: formData.product_name || "",
        full_product_name: formData.full_product_name || "",
        unit: formData.unit || "",
        slug: formData.slug || "",
        categories:
          formData.categories.map((cat) => ({
            product_category_id: cat.product_category_id,
            product_category_parent: cat.product_category_parent
              ? cat.product_category_parent
              : null,
            product_category_name: cat.product_category_name,
            category_hierarchy: cat.category_hierarchy,
          })) || [],
        variants:
          formData.variants.map((variant) => ({
            variant_id: variant.variant_id,
            variant_name: variant.variant_name,
            variant_values: variant.variant_values.map((value) => ({
              variant_value_id: value.variant_value_id,
              variant_value_name: value.variant_value_name,
            })),
          })) || [],
        product_by_variant:
          formData.product_by_variant.map((variant) => ({
            full_product_name: variant.full_product_name,
            sku: variant.sku,
            sku_product_unique_code: variant.sku_product_unique_code,
          })) || [],
        // Optional fields
        ...(formData.vendor_sku && { vendor_sku: formData.vendor_sku }),
        ...(formData.description && { description: formData.description }),
      };

      const response = await createInventoryProduct(inventoryData);

      toast({
        variant: "default",
        title: "Success",
        description: "Product has been created successfully",
      });

      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    if (onClose) {
      onClose();
    } else {
      router.push("/dashboard/inventory");
    }
  };

  const isFormValid =
    form.formState.isValid &&
    form.watch("brand") &&
    form.watch("productName") &&
    !isLoadingProductTypes;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col"
      >
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <section className="space-y-8">
            {/* Basic Information Section */}
            <div className="border rounded-md shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <p className="text-sm text-gray-600 mb-4">
                Provide the basic details about the product, including name,
                description, and other essential information.
              </p>
              <div className="space-y-4">
                <BasicInfo form={form} />
              </div>
            </div>

            {/* Variant Configuration Section */}
            <div className="border rounded-md shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">
                Variant Configuration
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Configure product variants, including combinations, prices, and
                SKUs.
              </p>
              <div className="space-y-4">
                <VariantCombinations />
              </div>
            </div>
          </section>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none border-t backdrop-blur-sm p-4">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid || isLoadingProductTypes}
              data-testid="submit-button"
            >
              {isLoadingProductTypes
                ? "Loading..."
                : isSubmitting
                ? initialData
                  ? "Updating..."
                  : "Adding..."
                : initialData
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
