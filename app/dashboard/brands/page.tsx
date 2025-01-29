'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BrandForm } from '@/components/brands/brand-form';
import { BrandList } from '@/components/brands/brand-list';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useBrands } from '@/lib/hooks/use-brands';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';
import type { Brand } from '@/types/brand';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  
  const {
    brands,
    pagination,
    isLoading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
  } = useBrands({
    search,
    page: currentPage,
    limit: pageSize,
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedBrand(undefined);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading brands. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">
            Manage your product brands
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Brand
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      <BrandList
        brands={brands}
        onEdit={(brand) => {
          setSelectedBrand(brand);
          setIsDialogOpen(true);
        }}
        onDelete={deleteBrand}
        onStatusChange={updateBrandStatus}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedBrand(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
            <DialogDescription>
              {selectedBrand 
                ? 'Edit brand details below'
                : 'Add a new brand to your catalog'
              }
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            onSubmit={async (data) => {
              if (selectedBrand) {
                await updateBrand({
                  id: selectedBrand.id,
                  data,
                });
              } else {
                await createBrand(data);
              }
              handleSuccess();
            }}
            initialData={selectedBrand}
            mode={selectedBrand ? "edit" : "create"}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={pagination?.totalItems ?? 0}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination?.totalPages ?? 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}