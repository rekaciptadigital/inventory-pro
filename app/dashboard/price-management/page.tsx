'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceManagementList } from '@/components/price-management/price-management-list';
import { useProducts } from '@/lib/hooks/use-products';

export default function PriceManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useProducts();

  const handleEdit = (productId: string) => {
    router.push(`/dashboard/price-management/${productId}`);
  };

  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Price Management</h1>
        <p className="text-muted-foreground">
          Manage product prices and pricing categories
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <PriceManagementList 
        products={filteredProducts}
        onEdit={handleEdit}
      />
    </div>
  );
}