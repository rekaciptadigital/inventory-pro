'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { BasicInfo } from './basic-info';
import { VariantCombinations } from './variant-combinations'; // Import VariantCombinations
import { productFormSchema, type ProductFormValues } from './form-schema';
import { generateSKU } from '@/lib/utils/sku-generator';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';

interface SingleProductFormProps {
  onSuccess?: (product: ProductFormValues) => void;
  onClose?: () => void;
  initialData?: ProductFormValues;
}

const defaultValues: ProductFormValues = {
  brand: '',
  productTypeId: '',
  sku: '',
  uniqueCode: '',
  fullProductName: '',
  productName: '',
  description: '',
  vendorSku: '',
  unit: 'PC',
};

export function SingleProductForm({ onSuccess, onClose, initialData }: Readonly<SingleProductFormProps>) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ?? defaultValues,
    mode: 'onChange'
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // Get brand and product type details
      const brand = brands.find(b => b.id.toString() === values.brand); // Ensure comparison is correct
      const productType = productTypes.find(pt => pt.id.toString() === values.productTypeId); // Ensure comparison is correct

      if (!brand || !productType) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid brand or product type selected',
        });
        return;
      }

      // Generate SKU if not provided
      if (!values.sku) {
        values.sku = generateSKU(brand, productType, values.uniqueCode);
      }

      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') ?? '[]');

      // Add new product to existing products
      existingProducts.push(values);

      // Save updated products to localStorage
      localStorage.setItem('products', JSON.stringify(existingProducts));

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard/inventory');
    }
  };

  const isFormValid = form.formState.isValid && form.watch('brand') && form.watch('productName');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <section className="p-4 border rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <p className="text-sm text-gray-600">Provide the basic details about the product, including name, description, and other essential information.</p>
          <div className="mt-4">
            <BasicInfo form={form} />
          </div>
        </section>

        {/* Variant Configuration Section */}
        <section className="p-4 border rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Variant Configuration</h2>
          <p className="text-sm text-gray-600">Configure product variants, including combinations, prices, and SKUs.</p>
          <div className="mt-4">
            <VariantCombinations />
          </div>
        </section>

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
            disabled={isSubmitting || !isFormValid}
            data-testid="submit-button"
          >
            {(() => {
              const buttonText = initialData ? 'Update Product' : 'Add Product';
              return isSubmitting ? `${buttonText}...` : buttonText;
            })()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
