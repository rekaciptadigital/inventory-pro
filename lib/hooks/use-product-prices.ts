'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Product } from '@/types/inventory';

export function useProductPrices() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProductPrices = async (
    productId: string,
    priceData: Partial<Product>
  ): Promise<void> => {
    try {
      setIsUpdating(true);
      
      // Get existing products
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Update product prices
      const updatedProducts = existingProducts.map((product: Product) => {
        if (product.id === productId) {
          return {
            ...product,
            ...priceData,
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      });

      // Save updated products
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      toast({
        title: 'Success',
        description: 'Product prices have been updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product prices',
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProductPrices,
    isUpdating,
  };
}