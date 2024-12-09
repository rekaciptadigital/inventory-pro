'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { BasicInfo } from './sections/basic-info';
import { VariantConfiguration } from './sections/variant-configuration';
import { SkuList } from './sections/sku-list';
import { variantFormSchema, type VariantFormValues } from './variant-form-schema';
import { generateVariantSKU } from '@/lib/utils/sku-generator';
import type { Product } from '@/types/inventory';

interface VariantFormProps {
  onSuccess?: (product: Product) => void;
  onClose?: () => void;
}

export function VariantForm({ onSuccess, onClose }: VariantFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Array<{
    typeId: string;
    values: string[];
  }>>([]);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      brand: '',
      productTypeId: '',
      productId: '',
      baseSku: '',
      description: '',
      variants: [],
      skus: [],
    },
  });

  const onSubmit = async (values: VariantFormValues) => {
    try {
      setIsSubmitting(true);

      // Generate variant products
      const variantProducts = selectedVariants.map(variant => {
        const sku = generateVariantSKU(values.baseSku, variant);
        return {
          id: Date.now().toString(),
          ...values,
          sku,
          variant,
        };
      });

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      localStorage.setItem('products', JSON.stringify([...existingProducts, ...variantProducts]));

      toast({
        title: 'Success',
        description: `${variantProducts.length} variant products have been added successfully`,
      });

      if (onSuccess) {
        onSuccess(variantProducts[0]);
      } else {
        router.push('/dashboard/inventory');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save variant products. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setSelectedVariants([]);
    
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard/inventory');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <BasicInfo form={form} />
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-4">Variant Configuration</h3>
            <VariantConfiguration
              selectedVariants={selectedVariants}
              onVariantsChange={setSelectedVariants}
              form={form}
            />
          </div>

          {selectedVariants.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Generated SKUs</h3>
              <SkuList
                baseSku={form.watch('baseSku')}
                selectedVariants={selectedVariants}
              />
            </div>
          )}
        </div>

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
            disabled={isSubmitting || selectedVariants.length === 0}
            data-testid="submit-button"
          >
            {isSubmitting ? 'Adding Variants...' : 'Add Variants'}
          </Button>
        </div>
      </form>
    </Form>
  );
}