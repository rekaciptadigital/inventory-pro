'use client';

import { useParams, useRouter } from 'next/navigation';
import { SingleProductForm } from '@/components/inventory/product-form/single-product-form';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { useToast } from '@/components/ui/use-toast';
import type { Product } from '@/types/inventory';

export function EditProductForm() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { products } = useInventory();
  
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  const handleSuccess = (updatedProduct: Product) => {
    toast({
      title: 'Success',
      description: 'Product has been updated successfully',
    });
    router.push('/dashboard/inventory');
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product information
        </p>
      </div>

      <div className="flex-1 border rounded-lg">
        <SingleProductForm 
          initialData={product}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}