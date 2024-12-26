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

// Definisi interface untuk properti yang diterima oleh komponen BrandFormDialog
interface BrandFormDialogProps {
  readonly open: boolean; // Menentukan apakah dialog terbuka atau tidak
  readonly onOpenChange: (open: boolean) => void; // Fungsi untuk mengubah status dialog
  readonly onSubmit: (data: BrandFormData) => Promise<void>; // Fungsi untuk menangani submit form
  readonly initialData?: Brand; // Data awal untuk form, opsional
  readonly mode: "create" | "edit"; // Mode dialog, bisa "create" atau "edit"
}

// Fungsi komponen untuk menampilkan dialog form brand
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
            await onSubmit(data); // Memanggil fungsi onSubmit dengan data form
            onOpenChange(false); // Menutup dialog setelah submit
          }}
          initialData={initialData} // Mengisi form dengan data awal jika ada
          onCancel={() => onOpenChange(false)} // Menutup dialog jika dibatalkan
        />
      </DialogContent>
    </Dialog>
  );
}
