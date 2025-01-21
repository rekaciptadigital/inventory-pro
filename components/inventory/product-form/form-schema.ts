// Schema validasi untuk form produk
// Menggunakan Zod untuk validasi tipe data dan aturan validasi

import * as z from "zod";

// Definisi schema untuk form produk
// Menentukan tipe data dan aturan validasi untuk setiap field
export const productFormSchema = z.object({
  // Data utama produk
  brand: z.string().min(1, "Brand is required"),
  productTypeId: z.string().min(1, "Product type is required"),

  // Struktur kategori bertingkat
  categoryId: z.string().min(1, "Product category is required"),
  subCategory1: z.string().optional(), // Sub kategori level 1 (opsional)
  subCategory2: z.string().optional(), // Sub kategori level 2 (opsional)
  subCategory3: z.string().optional(), // Sub kategori level 3 (opsional)

  // Informasi identifikasi produk
  sku: z.string(),
  uniqueCode: z.string().optional(),
  fullProductName: z.string(),
  vendorSku: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),

  // Informasi tambahan
  description: z.string().optional(),
  unit: z.enum(["PC", "PACK", "SET"]), // Unit produk harus salah satu dari opsi ini

  // Data varian produk
  variants: z
    .array(
      z.object({
        variant_id: z.number(),
        variant_name: z.string(),
        variant_values: z.array(
          z.object({
            variant_value_id: z.number(),
            variant_value_name: z.string(),
          })
        ),
      })
    )
    .default([]),
  variantPrices: z.record(z.number()).optional(),
});

// Tipe data untuk nilai form
// Menambahkan field usdPrice yang tidak ada di schema
export type ProductFormValues = z.infer<typeof productFormSchema> & {
  usdPrice?: number;
};
