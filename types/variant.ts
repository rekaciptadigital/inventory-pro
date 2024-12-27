/**
 * Interface untuk nilai varian
 * Mendefinisikan struktur data untuk setiap nilai dalam tipe varian
 */
export interface VariantValue {
  id: number;
  name: string;
}

/**
 * Interface untuk tipe varian
 * Mendefinisikan struktur data utama untuk tipe varian dan propertinya
 * Termasuk informasi status, urutan tampilan, dan nilai-nilai yang terkait
 */
export interface VariantType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  display_order: number;
  status: boolean;
  values: VariantValue[];  // Change this line
}

/**
 * Interface untuk data form varian
 * Digunakan saat membuat atau mengubah data varian
 */
export interface VariantFormData {
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}