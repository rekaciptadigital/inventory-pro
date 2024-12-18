"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandForm } from "@/components/brands/brand-form";
import { BrandList } from "@/components/brands/brand-list";
import { useBrands } from "@/lib/hooks/use-brands";
import type { Brand } from "@/types/brand";
import type { BrandFormData } from "@/lib/api/brands";

const ITEMS_PER_PAGE = 10;

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();

  const {
    brands,
    pagination,
    isLoading,
    createBrand,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
  } = useBrands({
    search,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const handleCreate = async (data: BrandFormData) => {
    await createBrand(data);
    setIsDialogOpen(false);
  };

  const handleUpdate = async (data: BrandFormData) => {
    if (!selectedBrand) return;
    await updateBrand({ id: selectedBrand.id, data });
    setIsDialogOpen(false);
    setSelectedBrand(undefined);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedBrand(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage your product brands</p>
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
              setPage(1); // Reset page when search changes
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBrand ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription>
              {selectedBrand
                ? "Edit the brand details below."
                : "Add a new brand to your product catalog."}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={selectedBrand}
            onSubmit={selectedBrand ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
