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
import { VariantSelection } from './variant-selection';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
import { calculateHBNaik, calculateQuantityPrices, calculateCustomerPrices } from '@/lib/utils/price-calculator';
import type { Brand } from '@/types/brand';
import type { Product } from '@/types/inventory';

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  initialData?: Product;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
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
    defaultValues: initialData ? {
      ...initialData,
      variants: initialData.variants || [],
    } : {
      brand: '',
      productTypeId: '',
      sku: '',
      vendorSku: '',
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
      variants: [],
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
      const product: Product = {
        id: initialData?.id || Date.now().toString(),
        ...values,
      };

      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Update or add product
      const updatedProducts = initialData
        ? existingProducts.map((p: Product) => p.id === product.id ? product : p)
        : [...existingProducts, product];
      
      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      toast({
        title: 'Success',
        description: `Product has been ${initialData ? 'updated' : 'added'} successfully`,
      });
      
      if (onSuccess) {
        onSuccess(product);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <BasicInfo form={form} brands={brands} />
          <VariantSelection />
          <PricingInfo form={form} />
          <QuantityPrices form={form} />
          <CustomerPrices form={form} />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating Product...' : 'Adding Product...') 
              : (initialData ? 'Update Product' : 'Add Product')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}