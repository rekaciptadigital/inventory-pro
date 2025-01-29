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
import { VariantForm } from '@/components/variants/variant-form';
import { VariantList } from '@/components/variants/variant-list';
import { useVariants } from '@/lib/hooks/variants/use-variants';
import { usePagination } from '@/lib/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';

export default function VariantsPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const {
    variants,
    pagination,
    isLoading,
    error,
    createVariant,
    updateVariant,
    deleteVariant,
  } = useVariants({
    search,
    page: currentPage,
    limit: pageSize,
    sort: 'id',
    order: 'ASC',
  });

  const handleEdit = (variant: Variant) => {
    setSelectedVariant(variant);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading variants. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Variants</h1>
          <p className="text-muted-foreground">
            Manage your product variant types and their values
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Variant
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search variants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1);
            }}
          />
        </div>
      </div>

      <VariantList
        variants={variants}
        onEdit={handleEdit}
        onDelete={deleteVariant}
        isLoading={isLoading}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedVariant(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVariant ? 'Edit Variant' : 'Add New Variant'}
            </DialogTitle>
            <DialogDescription>
              {selectedVariant
                ? 'Edit variant details below'
                : 'Add a new variant type to your system'
              }
            </DialogDescription>
          </DialogHeader>
          <VariantForm
            onSubmit={async (data) => {
              if (selectedVariant) {
                await updateVariant({
                  id: selectedVariant.id.toString(),
                  data,
                });
              } else {
                await createVariant(data);
              }
              setIsDialogOpen(false);
            }}
            initialData={selectedVariant}
            isSubmitting={isLoading}
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