"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination/pagination-controls";
import { PaginationInfo } from "@/components/ui/pagination/pagination-info";
import { BrandList } from "@/components/brands/brand-list";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useBrands } from "@/lib/hooks/use-brands";
import { BrandFormDialog } from "@/components/brands/brand-form-dialog";
import type { Brand } from "@/types/brand";

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    usePagination();

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

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setOpenFormDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedBrand(undefined);
    setOpenFormDialog(false);
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
          <p className="text-muted-foreground">Manage your product brands</p>
        </div>
        <Button onClick={() => setOpenFormDialog(true)}>
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
        onEdit={handleEdit}
        onDelete={deleteBrand}
        onStatusChange={updateBrandStatus}
      />

      <BrandFormDialog
        open={openFormDialog}
        onOpenChange={handleCloseDialog}
        onSubmit={
          selectedBrand
            ? (data) => updateBrand({ id: selectedBrand.id, data })
            : createBrand
        }
        initialData={selectedBrand}
        mode={selectedBrand ? "edit" : "create"}
      />

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
