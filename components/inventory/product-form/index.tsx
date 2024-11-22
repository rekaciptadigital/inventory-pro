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
import type { Brand } from '@/types/brand';

interface ProductFormProps {
  onSuccess?: (product: any) => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { categories } = usePriceCategories();

  useEffect(() => {
    const savedBrands = localStorage.getItem('brands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    }
  }, []);

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

  useEffect(() => {
    const hbReal = form.watch('hbReal');
    const adjustmentPercentage = form.watch('adjustmentPercentage');

    if (hbReal > 0) {
      const hbNaik = calculateHBNaik(hbReal, adjustmentPercentage);
      form.setValue('hbNaik', hbNaik);

      const quantityPrices = calculateQuantityPrices(hbNaik);
      form.setValue('quantities', quantityPrices);

      const customerPrices = calculateCustomerPrices(hbNaik, categories);
      form.setValue('customerPrices', customerPrices);
    }
  }, [form.watch('hbReal'), form.watch('adjustmentPercentage'), categories]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create new product object with ID
      const newProduct = {
        id: Date.now().toString(),
        ...values,
      };

      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Add new product
      const updatedProducts = [...existingProducts, newProduct];
      
      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      toast({
        title: 'Success',
        description: 'Product has been added successfully',
      });
      
      if (onSuccess) {
        onSuccess(newProduct);
      }
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
        <BasicInfo form={form} brands={brands} />
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