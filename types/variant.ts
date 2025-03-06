/**
 * Interface untuk nilai varian
 * Mendefinisikan struktur data untuk setiap nilai dalam tipe varian
 * Properties:
 * - id: ID unik untuk nilai varian
 * - name: Nama nilai varian
 * - code: Kode unik untuk nilai varian
 * - order: Urutan tampilan nilai varian
 */
export interface VariantValue {
  id: number;
  name: string;
  code: string;
  order: number;
}

/**
 * Interface untuk tipe varian
 * Mendefinisikan struktur data utama untuk tipe varian
 * Properties:
 * - id: ID unik tipe varian
 * - name: Nama tipe varian
 * - display_order: Urutan tampilan tipe varian
 * - status: Status aktif/nonaktif tipe varian
 * - values: Array dari nilai-nilai varian yang terkait
 * - created_at: Timestamp pembuatan
 * - updated_at: Timestamp terakhir diupdate
 * - deleted_at: Timestamp penghapusan (soft delete)
 */
export interface VariantType {
  id: number;
  name: string;
  values: string[];
  display_order: number;
}

/**
 * Interface untuk data formulir varian
 * Digunakan untuk validasi dan pengiriman data saat membuat/mengubah varian
 * Properties:
 * - name: Nama tipe varian
 * - display_order: Urutan tampilan
 * - status: Status aktif/nonaktif
 * - values: Array string untuk nilai-nilai varian
 */
export interface VariantFormData {
  name: string;
  display_order: number;
  status: boolean;
  values: string[];
}

/**
 * Interface untuk varian yang dipilih dalam form produk
 */
export interface SelectedVariant {
  id: string;
  typeId: number;
  values: string[];
  availableValues?: string[];
  display_order?: number;
}

/**
 * Interface untuk tipe varian yang telah dipilih untuk kombinasi
 */
export interface SelectedVariantType {
  id: number;
  name: string;
  values: string[];
}
