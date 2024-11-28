'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductTypeForm } from '@/components/product-types/product-type-form';
import { ProductTypeList } from '@/components/product-types/product-type-list';
import type { ProductType } from '@/types/product-type';

export default function ProductTypesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | undefined>();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProductType(undefined);
  };

  const handleEdit = (productType: ProductType) => {
    setSelectedProductType(productType);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Types</h1>
          <p className="text-muted-foreground">
            Manage your product types
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedProductType(undefined);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProductType ? 'Edit Product Type' : 'Add New Product Type'}
              </DialogTitle>
              <DialogDescription>
                {selectedProductType 
                  ? 'Edit the product type details below.'
                  : 'Add a new product type to your catalog.'
                }
              </DialogDescription>
            </DialogHeader>
            <ProductTypeForm 
              onSuccess={handleSuccess}
              initialData={selectedProductType}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ProductTypeList onEdit={handleEdit} />
    </div>
  );
}