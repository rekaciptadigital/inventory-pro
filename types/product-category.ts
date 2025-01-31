// Tipe data untuk kategori produk yang digunakan di seluruh aplikasi
// Mendukung struktur data hierarki (parent-child) dan status aktif/nonaktif
export interface ProductCategory {
  id: number;
  name: string;
  code?: string;
  description?: string; // Changed from string | null to string | undefined
  status: boolean;
  parent_id?: number;
  children?: ProductCategory[];
  parents?: ProductCategory[];
}
