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
import { ProductTypeForm } from '@/components/product-types/product-type-form';
import { ProductTypeList } from '@/components/product-types/product-type-list';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useProductTypes } from '@/lib/hooks/product-types/use-product-types';
import type { ProductType } from '@/types/product-type';

export default function ProductTypesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | undefined>();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const {
    productTypes,
    pagination,
    isLoading,
    error,
    createProductType,
    updateProductType,
    deleteProductType,
    updateProductTypeStatus,
  } = useProductTypes({
    search,
    page: currentPage,
    limit: pageSize,
  });

  // Get existing codes for validation
  const existingCodes = productTypes.map(type => type.code);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProductType(undefined);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading product types. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Types</h1>
          <p className="text-muted-foreground">
            Manage your product types
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Type
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search product types..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1);
            }}
          />
        </div>
      </div>

      <ProductTypeList
        productTypes={productTypes}
        onEdit={(productType) => {
          setSelectedProductType(productType);
          setIsDialogOpen(true);
        }}
        onDelete={deleteProductType}
        onStatusChange={async (id, status) => {
          await updateProductTypeStatus(id, status);
        }}
        isLoading={isLoading}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedProductType(undefined);
        }}
      >
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
            onSubmit={async (data) => {
              if (selectedProductType) {
                await updateProductType({
                  id: selectedProductType.id,
                  data,
                });
              } else {
                await createProductType(data);
              }
              handleSuccess();
            }}
            initialData={selectedProductType}
            isSubmitting={isLoading}
            existingCodes={existingCodes}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={pagination?.totalItems || 0}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}