"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandForm } from "./brand-form";
import type { Brand } from "@/types/brand";
import type { BrandFormData } from "@/lib/api/brands";

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BrandFormData) => Promise<void>;
  initialData?: Brand;
  mode: "create" | "edit";
}

export function BrandFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: BrandFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Brand" : "Edit Brand"}
          </DialogTitle>
        </DialogHeader>
        <BrandForm
          onSubmit={async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          }}
          initialData={initialData}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
