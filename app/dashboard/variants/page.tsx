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
import { VariantTypeForm } from '@/components/variants/variant-type-form';
import { VariantTypeList } from '@/components/variants/variant-type-list';
import type { VariantType } from '@/types/variant';

export default function VariantsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariantType, setSelectedVariantType] = useState<VariantType | undefined>();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedVariantType(undefined);
  };

  const handleEdit = (variantType: VariantType) => {
    setSelectedVariantType(variantType);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Variants</h1>
          <p className="text-muted-foreground">
            Manage your product variant types
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedVariantType(undefined);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Variant Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedVariantType ? 'Edit Variant Type' : 'Add New Variant Type'}
              </DialogTitle>
              <DialogDescription>
                {selectedVariantType 
                  ? 'Edit the variant type details below.'
                  : 'Add a new variant type to your catalog.'
                }
              </DialogDescription>
            </DialogHeader>
            <VariantTypeForm 
              onSuccess={handleSuccess}
              initialData={selectedVariantType}
            />
          </DialogContent>
        </Dialog>
      </div>

      <VariantTypeList onEdit={handleEdit} />
    </div>
  );
}