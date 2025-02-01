// Schema validasi untuk form produk
// Menggunakan Zod untuk validasi tipe data dan aturan validasi

import * as z from "zod";

// Schema for API data format
const apiFieldsSchema = z.object({
  brand_id: z.string().optional(),
  brand_code: z.string().optional(),
  brand_name: z.string().optional(),
  product_type_id: z.string().optional(),
  product_type_code: z.string().optional(),
  product_type_name: z.string().optional(),
  unique_code: z.string().optional(),
  product_name: z.string().optional(),
  full_product_name: z.string().optional(),
  vendor_sku: z.string().optional(),
  categories: z.array(z.object({
    product_category_id: z.string(),
    product_category_parent: z.string().nullable(),
    product_category_name: z.string(),
    category_hierarchy: z.number(),
  })).optional(),
});

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
  variantPrices: z.record(z.string(), z.number()).optional(),
});

// Use direct interface mapping for API fields
interface ApiFields {
  brand_id?: string;
  brand_code?: string;
  brand_name?: string;
  product_type_id?: string;
  product_type_code?: string;
  product_type_name?: string;
  unique_code?: string;
  product_name?: string;
  full_product_name?: string;
  vendor_sku?: string;
  categories?: Array<{
    product_category_id: string;
    product_category_parent: string | null;
    product_category_name: string;
    category_hierarchy: number;
  }>;
}

export type ProductFormValues = z.infer<typeof productFormSchema> & ApiFields;
