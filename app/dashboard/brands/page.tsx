'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { BrandForm } from '@/components/brands/brand-form';
import { BrandList } from '@/components/brands/brand-list';
import type { Brand } from '@/types/brand';

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();

  // Load brands from localStorage on component mount
  useEffect(() => {
    const savedBrands = localStorage.getItem('brands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    }
  }, []);

  const handleSuccess = (brand: Brand) => {
    if (selectedBrand) {
      // Update existing brand in the list
      setBrands(brands.map(b => b.id === brand.id ? brand : b));
    } else {
      // Add new brand to the list
      setBrands([...brands, brand]);
    }
    setIsDialogOpen(false);
    setSelectedBrand(undefined);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">
            Manage your product brands
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedBrand(undefined);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              <DialogDescription>
                {selectedBrand 
                  ? 'Edit the brand details below.'
                  : 'Add a new brand to your product catalog.'
                }
              </DialogDescription>
            </DialogHeader>
            <BrandForm 
              onSuccess={handleSuccess}
              initialData={selectedBrand}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <BrandList 
        brands={filteredBrands}
        onEdit={handleEdit}
      />
    </div>
  );
}