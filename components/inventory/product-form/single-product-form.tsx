"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { BasicInfo } from "./basic-info";
import { VariantCombinations } from "./variant-combinations"; // Import VariantCombinations
import { productFormSchema, type ProductFormValues } from "./form-schema";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypeList } from "@/lib/hooks/product-types/use-product-type-list";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store/store";
import {
  createInventoryProduct,
  CreateInventoryData,
  updateInventoryProduct,
} from "@/lib/api/inventory";
import { 
  setBrand, 
  setProductType, 
  updateProductCategories, 
  setVariants,
  resetFormState,
  updateForm,  // Add this import
  updateProductByVariant
} from "@/lib/store/slices/formInventoryProductSlice";

// Update interfaces at the top
interface FormattedVariant {
  variant_id: string;
  variant_name: string;
  variant_values: {
    variant_value_id: string;
    variant_value_name: string;
  }[];
}

// Update to match ProductVariant type exactly
interface ReduxVariant {
  variant_id: number;
  variant_name: string;
  variant_values: {
    variant_value_id: string; // Keep as string to match ProductVariant
    variant_value_name: string;
  }[];
}

interface FormattedCategory {
  product_category_id: string;
  product_category_parent: string | null;
  product_category_name: string;
  category_hierarchy: number;
}

interface SingleProductFormProps {
  onSuccess?: (product: ProductFormValues) => void;
  onClose?: () => void;
  initialData?: ProductFormValues;
}

const defaultValues: ProductFormValues = {
  brand: "",
  productTypeId: "",
  categoryId: "", // Add missing required field
  sku: "",
  uniqueCode: "",
  fullProductName: "",
  productName: "",
  description: "",
  vendorSku: "",
  unit: "PC",
  variants: [], // Add missing required field
  variantCount: 0,
  variantOptions: [],
  variantValues: {},
  variantPrices: {},
  product_by_variant: [] // Add if it's required in ProductFormValues
};

// Add this interface at the top with other interfaces
interface SubmissionData extends Omit<CreateInventoryData, 'product_type_id' | 'brand_id'> {
  product_type_id: string;
  brand_id: string;
}

export function SingleProductForm({
  onClose,
  initialData,
}: Readonly<SingleProductFormProps>) {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { brands } = useBrands();
  const { data: productTypesData, isLoading: isLoadingProductTypes } =
    useProductTypeList();
  const productTypes = productTypesData?.data ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      brand: initialData?.brand_id?.toString() ?? '',
      productTypeId: initialData?.product_type_id?.toString() ?? '',
      sku: initialData?.sku ?? '',
      uniqueCode: initialData?.unique_code ?? '',
      fullProductName: initialData?.full_product_name ?? '',
      productName: initialData?.product_name ?? '',
      description: initialData?.description ?? '',
      vendorSku: initialData?.vendor_sku || '',
      unit: initialData?.unit ?? 'PC',
      categoryId: initialData?.categories?.[0]?.product_category_id?.toString() ?? '',
    },
    mode: "onChange",
  });

  // Add initialization tracker
  const [isInitialized, setIsInitialized] = useState(false);

  // Modify initialization effect
  useEffect(() => {
    if (!isInitialized && initialData) {
      try {
        setIsInitialized(true); // Set this first to prevent multiple initializations
        
        // Create a batch of updates
        const updates: Array<() => void> = [];

        if (initialData.brand_id && initialData.brand_code && initialData.brand_name) {
          updates.push(() => {
            dispatch(setBrand({
              id: parseInt(initialData.brand_id),
              code: initialData.brand_code,
              name: initialData.brand_name,
            }));
            form.setValue('brand', initialData.brand_id.toString(), { shouldValidate: true });
          });
        }
        
        if (initialData.product_type_id && initialData.product_type_code && initialData.product_type_name) {
          updates.push(() => {
            dispatch(setProductType({
              id: parseInt(initialData.product_type_id),
              code: initialData.product_type_code,
              name: initialData.product_type_name,
            }));
            form.setValue('productTypeId', initialData.product_type_id.toString(), { shouldValidate: true });
          });
        }

        if (initialData.categories?.length > 0) {
          // Ensure all categories are properly formatted and sorted
          const formattedCategories = initialData.categories
            .map(cat => ({
              product_category_id: String(cat.product_category_id),
              product_category_name: cat.product_category_name,
              product_category_parent: cat.product_category_parent ? String(cat.product_category_parent) : null,
              category_hierarchy: Number(cat.category_hierarchy)
            }))
            .sort((a, b) => a.category_hierarchy - b.category_hierarchy);

          // Update Redux store with all categories
          dispatch(updateProductCategories(formattedCategories));
          
          // Set initial category ID for the form
          form.setValue('categoryId', formattedCategories[0].product_category_id, { 
            shouldValidate: true 
          });
        }

        if (initialData.variants?.length > 0) {
          updates.push(() => {
            // Convert to Redux format (keep variant_value_id as string)
            const reduxVariants: ReduxVariant[] = initialData.variants.map(variant => ({
              variant_id: parseInt(variant.variant_id.toString()),
              variant_name: variant.variant_name,
              variant_values: variant.values.map(value => ({
                variant_value_id: value.variant_value_id.toString(), // Keep as string
                variant_value_name: value.variant_value_name,
              })),
            }));

            dispatch(setVariants(reduxVariants));
          });
        }

        // Execute all updates in one batch
        updates.forEach(update => update());

        // Set other form values
        form.reset({
          ...form.getValues(),
          sku: initialData.sku ?? '',
          uniqueCode: initialData.unique_code ?? '',
          fullProductName: initialData.full_product_name ?? '',
          productName: initialData.product_name ?? '',
          description: initialData.description ?? '',
          vendorSku: initialData.vendor_sku ?? '',
          unit: initialData.unit ?? 'PC',
        }, { keepDefaultValues: true });

        // Initialize product variants with their status
        if (initialData.product_by_variant?.length > 0) {
          const variantData = initialData.product_by_variant.map(variant => ({
            ...variant,
            status: variant.status ?? true, // Ensure status is properly loaded from API
            full_product_name: variant.full_product_name,
            sku: variant.sku,
            sku_product_unique_code: variant.sku_product_unique_code,
            vendor_sku: variant.sku_vendor || '' // Use sku_vendor from API response
          }));
          
          dispatch(updateForm({
            product_by_variant: variantData
          }));
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
        setIsInitialized(false); // Reset on error
      }
    }
  }, [dispatch, form, initialData, isInitialized]);

  // Modify cleanup effect
  useEffect(() => {
    return () => {
      if (!initialData) {
        dispatch(resetFormState());
        form.reset(defaultValues);
      }
      setIsInitialized(false); // Reset initialization state on unmount
    };
  }, [dispatch, form, initialData]);

  // Add selector for form data from Redux
  const formData = useSelector(
    (state: RootState) => state.formInventoryProduct
  );

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // For debugging only - remove in production
      if (initialData) {
        console.log('Update mode for product ID:', initialData.id);
      }
      
      // Add detailed logging to diagnose
      console.log('Original variant data:', formData.product_by_variant);
      
      // Fix the mapping to handle API inconsistency - try using 'sku' field name instead
      const apiCompatibleVariants = formData.product_by_variant.map((variant) => {
        // Start with the ID if it exists
        const result: any = {};
        
        if (variant.id) {
          result.id = variant.id;
        }
        
        // Add required fields as per API example
        result.full_product_name = variant.full_product_name;
        
        // Use "sku" here instead of "sku_product_variant" to match the example API request
        result.sku = variant.sku || `${formData.sku}-${variant.sku_product_unique_code}`;
        
        result.sku_product_unique_code = variant.sku_product_unique_code;
        result.sku_vendor = variant.vendor_sku?.trim() || null;
        result.status = variant.status ?? true;
        
        return result;
      });
      
      // Log the first variant for debugging
      console.log('First variant payload:', apiCompatibleVariants[0]);

      const submissionData: CreateInventoryData = {
        brand_id: parseInt(formData.brand_id?.toString() || "0"),
        brand_code: formData.brand_code || "",
        brand_name: formData.brand_name || "",
        product_type_id: parseInt(formData.product_type_id?.toString() || "0"),
        product_type_code: formData.product_type_code || "",
        product_type_name: formData.product_type_name || "",
        unique_code: formData.unique_code || "",
        sku: formData.sku || "",
        product_name: formData.product_name || "",
        full_product_name: formData.full_product_name || "",
        unit: formData.unit || "",
        slug: formData.slug || "",
        categories: formData.categories.map((cat) => ({
          product_category_id: parseInt(cat.product_category_id.toString()),
          product_category_parent: cat.product_category_parent
            ? parseInt(cat.product_category_parent.toString())
            : null,
          product_category_name: cat.product_category_name,
          category_hierarchy: cat.category_hierarchy,
        })),
        variants: formData.variants.map((variant) => ({
          variant_id: parseInt(variant.variant_id.toString()),
          variant_name: variant.variant_name,
          variant_values: variant.variant_values.map((value) => ({
            variant_value_id: parseInt(value.variant_value_id.toString()),
            variant_value_name: value.variant_value_name,
          })),
        })),
        product_by_variant: apiCompatibleVariants,
      };

      // Only conditionally add optional fields at the root level
      if (formData.vendor_sku && formData.vendor_sku.trim() !== '') {
        submissionData.vendor_sku = formData.vendor_sku.trim();
      }
      
      if (formData.description && formData.description.trim() !== '') {
        submissionData.description = formData.description.trim();
      }

      console.log('Sending API payload:', JSON.stringify(submissionData, null, 2));

      // Use the new API handler functions
      const result = initialData
        ? await updateInventoryProduct(initialData.id.toString(), submissionData)
        : await createInventoryProduct(submissionData);

      toast({
        variant: "default",
        title: "Success",
        description: `Product has been ${initialData ? 'updated' : 'created'} successfully`,
      });

      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Error handling product:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("API response error:", error.response.data);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to handle product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Only reset if not in edit mode
    if (!initialData) {
      dispatch(resetFormState());
    }
    form.reset(defaultValues);
    if (onClose) {
      onClose();
    } else {
      router.push("/dashboard/inventory");
    }
  };

  // Perbaiki kondisi validasi form - tetap pertahankan logikanya
  const isFormValid = useMemo(() => {
    const isBrandValid = Boolean(form.watch("brand"));
    const isProductNameValid = Boolean(form.watch("productName") || form.watch("fullProductName"));
    const isFormValid = !form.formState.errors || Object.keys(form.formState.errors).length === 0;
    
    return isBrandValid && isProductNameValid && isFormValid && !isLoadingProductTypes;
  }, [form.formState, form.watch, isLoadingProductTypes]);

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
                <BasicInfo form={form} initialData={initialData} />
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
              title={
                isSubmitting 
                  ? "Form is submitting..." 
                  : !isFormValid 
                    ? "Please fill in all required fields" 
                    : isLoadingProductTypes 
                      ? "Loading product types..." 
                      : ""
              }
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