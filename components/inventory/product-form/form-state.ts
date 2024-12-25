'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { productFormSchema, type ProductFormValues } from './form-schema';
import type { Product } from '@/types/inventory';

interface UseProductFormProps {
  initialData?: Product;
  onSuccess?: (product: Product) => void;
}

export function useProductForm({ initialData, onSuccess }: UseProductFormProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      brand: '',
      productTypeId: '',
      sku: '',
      uniqueCode: '',
      fullProductName: '',
      productName: '',
      description: '',
      vendorSku: '',
      unit: 'PC',
    },
  });

  const handleSubmit = useCallback(async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('products', JSON.stringify([...existingProducts, newProduct]));

      toast({
        title: 'Success',
        description: 'Product has been added successfully',
      });

      if (onSuccess) {
        onSuccess(newProduct);
      } else {
        router.push('/dashboard/inventory');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [router, toast, onSuccess]);

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}