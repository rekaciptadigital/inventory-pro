import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productPriceSchema } from '@/lib/validations/product-price';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { CustomerPrices } from '@/components/inventory/product-form/customer-prices';
import { PricingInfo } from '@/components/inventory/product-form/pricing-info';
import { useToast } from '@/components/ui/use-toast';
import { usePriceCalculations } from '@/lib/hooks/use-price-calculations';
import type { Product } from '@/types/inventory';

interface PriceEditFormProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PriceEditForm({ 
  product, 
  open, 
  onOpenChange,
  onSuccess 
}: PriceEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(productPriceSchema),
    defaultValues: {
      usdPrice: product.usdPrice || 0,
      exchangeRate: product.exchangeRate || 0,
      hbReal: product.hbReal || 0,
      adjustmentPercentage: product.adjustmentPercentage || 0,
      hbNaik: product.hbNaik || 0,
      customerPrices: product.customerPrices || {},
      percentages: product.percentages || {},
    },
  });

  const { updateHBNaik, updateHBReal, updateCustomerPrices } = usePriceCalculations(form);

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Get existing products
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Update product prices
      const updatedProducts = existingProducts.map((p: Product) => {
        if (p.id === product.id) {
          return {
            ...p,
            ...values,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Save updated products
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      toast({
        title: 'Success',
        description: 'Product prices have been updated successfully',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product prices',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product Prices</DialogTitle>
          <DialogDescription>
            Update pricing information for {product.productName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium">Product Code</label>
                <p className="mt-1">{product.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <p className="mt-1">{product.productName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Product Category</label>
                <p className="mt-1">{product.productTypeId}</p>
              </div>
            </div>

            {/* Pricing Information */}
            <PricingInfo form={form} />

            {/* Customer Category Prices */}
            <CustomerPrices form={form} />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Prices'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}