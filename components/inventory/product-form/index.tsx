'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { productFormSchema, type ProductFormValues } from './form-schema';
import { BasicInfo } from './basic-info';
import { PricingInfo } from './pricing-info';
import { QuantityPrices } from './quantity-prices';
import { CustomerPrices } from './customer-prices';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
import { calculateHBNaik, calculateQuantityPrices, calculateCustomerPrices } from '@/lib/utils/price-calculator';

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories } = usePriceCategories();

  // Create dynamic customer prices schema based on categories
  const defaultCustomerPrices = Object.fromEntries(
    categories.map(cat => [cat.name.toLowerCase(), 0])
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      brand: '',
      sku: '',
      productName: '',
      unit: 'PC',
      hbReal: 0,
      adjustmentPercentage: 0,
      hbNaik: 0,
      usdPrice: 0,
      exchangeRate: 0,
      quantities: {
        min15: 0,
        min10: 0,
        min5: 0,
        single: 0,
        retail: 0,
      },
      customerPrices: defaultCustomerPrices,
    },
  });

  // Calculate prices when base values change
  useEffect(() => {
    const hbReal = form.watch('hbReal');
    const adjustmentPercentage = form.watch('adjustmentPercentage');

    if (hbReal > 0) {
      // Calculate HB Naik
      const hbNaik = calculateHBNaik(hbReal, adjustmentPercentage);
      form.setValue('hbNaik', hbNaik);

      // Calculate quantity-based prices
      const quantityPrices = calculateQuantityPrices(hbNaik);
      form.setValue('quantities', quantityPrices);

      // Calculate customer category prices
      const customerPrices = calculateCustomerPrices(hbNaik, categories);
      form.setValue('customerPrices', customerPrices);
    }
  }, [form.watch('hbReal'), form.watch('adjustmentPercentage'), categories]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Saving product:', values);
      
      toast({
        title: 'Success',
        description: 'Product has been added successfully',
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfo form={form} />
        <PricingInfo form={form} />
        <QuantityPrices form={form} />
        <CustomerPrices form={form} />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}