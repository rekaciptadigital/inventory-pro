'use client';

import { useState } from 'react';
import { SingleProductForm } from './single-product-form';
import { VariantForm } from '../variant-form/variant-form';
import { ProductDropdown } from '../product-dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from '@/types/inventory';

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formType, setFormType] = useState<'single' | 'variant' | null>(null);

  const handleSingleProduct = () => {
    setFormType('single');
    setIsDialogOpen(true);
  };

  const handleProductVariant = () => {
    setFormType('variant');
    setIsDialogOpen(true);
  };

  const handleSuccess = (product: Product) => {
    setIsDialogOpen(false);
    setFormType(null);
    if (onSuccess) {
      onSuccess(product);
    }
  };

  return (
    <>
      <ProductDropdown
        onSingleProduct={handleSingleProduct}
        onProductVariant={handleProductVariant}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formType === 'single' ? 'Add Single Product' : 'Add Product with Variants'}
            </DialogTitle>
            <DialogDescription>
              {formType === 'single'
                ? 'Add a new product to your inventory'
                : 'Create multiple product variants at once'
              }
            </DialogDescription>
          </DialogHeader>

          {formType === 'single' && (
            <SingleProductForm onSuccess={handleSuccess} />
          )}

          {formType === 'variant' && (
            <VariantForm onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}