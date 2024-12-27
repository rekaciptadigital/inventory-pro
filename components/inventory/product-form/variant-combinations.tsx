// components/inventory/product-form/variant-combinations.tsx
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariantTypeSelect } from '@/components/variants/variant-type-select';
import { VariantValuesSelect } from '@/components/variants/variant-values-select';
import { GeneratedSkusTable } from '@/components/inventory/variant-form/sections/generated-skus-table';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import type { ProductFormValues } from './form-schema';

/**
 * Interface untuk struktur data varian yang dipilih
 * typeId: ID numerik untuk tipe varian
 * values: Array string berisi nilai-nilai yang dipilih untuk tipe varian tersebut
 */
interface SelectedVariant {
  typeId: number;  // Make sure this is number
  values: string[];
}

/**
 * Komponen VariantCombinations
 * 
 * Komponen ini menangani pembuatan dan pengelolaan kombinasi varian produk.
 * Memungkinkan pengguna untuk:
 * - Menambah/menghapus tipe varian
 * - Memilih nilai-nilai untuk setiap tipe varian
 * - Menghasilkan SKU otomatis berdasarkan kombinasi varian
 */
export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);

  /**
   * Hooks untuk mengambil data brands dan product types
   * Data ini digunakan untuk menampilkan nama brand dan tipe produk
   * dalam generated SKU
   */
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();

  /**
   * Memantau perubahan nilai form menggunakan watch
   * Nilai-nilai ini digunakan untuk membuat SKU dan mengatur harga dasar
   */
  // Watch form values
  const brand = form.watch('brand');
  const productTypeId = form.watch('productTypeId');
  const sku = form.watch('sku');
  const basePrice = form.watch('usdPrice') || 0;
  const productName = form.watch('productName');

  // Get brand and product type names
  const brandName = brands?.find(b => b.id === brand)?.name || '';
  const productTypeName = productTypes?.find(pt => pt.id === productTypeId)?.name || '';

  // Product details for SKU generation
  const productDetails = {
    brand: brandName,
    productType: productTypeName,
    productName,
  };

  /**
   * Fungsi untuk menambah baris varian baru
   * Menginisialisasi dengan typeId 0 dan array values kosong
   */
  const handleAddVariant = () => {
    setSelectedVariants(prev => [...prev, { typeId: 0, values: [] }]);  // Changed from '' to 0
  };

  /**
   * Fungsi untuk menghapus baris varian berdasarkan index
   * Memperbarui state dan nilai form setelah penghapusan
   */
  const handleRemoveVariant = (index: number) => {
    setSelectedVariants(prev => prev.filter((_, i) => i !== index));
    form.setValue('variants', selectedVariants.filter((_, i) => i !== index));
  };

  /**
   * Fungsi untuk menangani perubahan tipe varian
   * Mereset nilai values menjadi array kosong saat tipe berubah
   */
  const handleTypeChange = (index: number, typeId: number) => {  // Changed parameter type to number
    setSelectedVariants(prev => prev.map((v, i) => 
      i === index ? { typeId, values: [] } : v
    ));
    form.setValue(`variants.${index}`, { typeId, values: [] });
  };

  /**
   * Fungsi untuk memperbarui nilai-nilai varian yang dipilih
   * Memperbarui state dan nilai form ketika nilai dipilih
   */
  const handleValuesChange = (index: number, values: string[]) => {
    setSelectedVariants(prev => prev.map((v, i) => 
      i === index ? { ...v, values } : v
    ));
    form.setValue(`variants.${index}.values`, values);
  };

  /**
   * Fungsi untuk memperbarui harga varian individual
   * Menyimpan harga dalam objek variantPrices dengan SKU sebagai key
   */
  const handlePriceChange = (sku: string, price: number) => {
    const variantPrices = form.getValues('variantPrices') || {};
    form.setValue('variantPrices', {
      ...variantPrices,
      [sku]: price,
    });
  };

  /**
   * Menyimpan daftar typeId yang sudah digunakan
   * Digunakan untuk mencegah pemilihan tipe varian yang sama
   */
  const usedTypeIds = selectedVariants.map(v => v.typeId).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedVariants.map((variant, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <VariantTypeSelect
                value={variant.typeId}
                onChange={(typeId) => handleTypeChange(index, typeId)}
                excludeIds={usedTypeIds.filter(id => id !== variant.typeId)}
              />
            </div>
            <div className="flex-1">
              <VariantValuesSelect
                variantTypeId={variant.typeId}
                value={variant.values}
                onChange={(values) => handleValuesChange(index, values)}
                disabled={!variant.typeId}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveVariant(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddVariant}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {selectedVariants.length > 0 && sku && (
        <div className="border rounded-lg p-4">
          <FormField
            control={form.control}
            name="variants"
            render={() => (
              <FormItem>
                <FormLabel>Generated SKUs</FormLabel>
                <GeneratedSkusTable
                  baseSku={sku}
                  basePrice={basePrice}
                  selectedVariants={selectedVariants}
                  onPriceChange={handlePriceChange}
                  productDetails={productDetails}
                />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
