'use client';

/**
 * Modul Pengaturan Kategori Harga
 * ------------------------------
 * Modul ini bertanggung jawab untuk:
 * 1. Mengelola kategori harga pelanggan dan marketplace
 * 2. Menyimpan dan memuat data dari localStorage
 * 3. Memvalidasi input pengguna
 * 4. Menghitung markup harga berdasarkan persentase
 */

import { useState, useEffect } from 'react';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { PriceCategory } from '@/types/settings';

/**
 * Schema Validasi Kategori
 * -----------------------
 * Menggunakan Zod untuk memvalidasi:
 * - Nama kategori: harus diisi
 * - Multiplier: harus lebih besar dari 0
 */
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  multiplier: z.number().min(0.01, 'Multiplier must be greater than 0'),
});

/**
 * Komponen Halaman Kategori Harga
 * ------------------------------
 * Fitur utama:
 * 1. Manajemen kategori harga pelanggan
 * 2. Manajemen kategori harga marketplace
 * 3. Penyimpanan otomatis ke localStorage
 * 4. Validasi input
 */
export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [marketplaceCategories, setMarketplaceCategories] = useState<PriceCategory[]>([]);

  /**
   * Hook useEffect - Inisialisasi Data
   * --------------------------------
   * Proses:
   * 1. Memeriksa data di localStorage
   * 2. Jika ada, muat data tersebut
   * 3. Jika tidak ada, buat data default
   * 4. Lakukan untuk kedua jenis kategori
   */
  useEffect(() => {
    const savedCategories = localStorage.getItem('priceCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Set default categories if none exist
      const defaultCategories = [
        { id: '1', name: 'Elite', percentage: 10, order: 0 },
        { id: '2', name: 'Super', percentage: 20, order: 1 },
        { id: '3', name: 'Basic', percentage: 30, order: 2 },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('priceCategories', JSON.stringify(defaultCategories));
    }

    // Load marketplace categories
    const savedMarketplaceCategories = localStorage.getItem('marketplaceCategories');
    if (savedMarketplaceCategories) {
      setMarketplaceCategories(JSON.parse(savedMarketplaceCategories));
    } else {
      const defaultMarketplaceCategories = [
        { id: '1', name: 'Shopee', percentage: 5, order: 0 },
        { id: '2', name: 'Tokopedia', percentage: 8, order: 1 },
        { id: '3', name: 'Lazada', percentage: 10, order: 2 },
      ];
      setMarketplaceCategories(defaultMarketplaceCategories);
      localStorage.setItem('marketplaceCategories', JSON.stringify(defaultMarketplaceCategories));
    }
  }, []);

  /**
   * Fungsi Manajemen Kategori Pelanggan
   * ---------------------------------
   */

  /**
   * addCategory
   * ----------
   * Menambah kategori baru dengan:
   * - ID: timestamp saat ini
   * - Nama: kosong (untuk diisi user)
   * - Persentase: 0 (untuk diisi user)
   * - Urutan: sesuai jumlah kategori
   */
  const addCategory = () => {
    const newCategory: PriceCategory = {
      id: Date.now().toString(),
      name: '', // Initialize with empty string
      percentage: 0, // Initialize with 0
      order: categories.length,
    };
    setCategories([...categories, newCategory]);
  };

  /**
   * removeCategory
   * -------------
   * Menghapus kategori dengan validasi:
   * - Mencegah penghapusan jika hanya 1 kategori
   * - Memperbarui localStorage setelah penghapusan
   */
  const removeCategory = (id: string) => {
    if (categories.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must have at least one category',
      });
      return;
    }
    setCategories(categories.filter(cat => cat.id !== id));
    localStorage.setItem('priceCategories', JSON.stringify(
      categories.filter(cat => cat.id !== id)
    ));
  };

  /**
   * updateCategory
   * -------------
   * Memperbarui data kategori:
   * - Dapat mengubah nama atau persentase
   * - Memvalidasi input persentase hanya angka
   * - Menyimpan perubahan ke localStorage
   */
  const updateCategory = (id: string, field: keyof PriceCategory, value: string | number) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === id) {
        return {
          ...cat,
          [field]: field === 'percentage' ? Number(value) || 0 : value || '',
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
    localStorage.setItem('priceCategories', JSON.stringify(updatedCategories));
  };

  /**
   * Fungsi Manajemen Kategori Marketplace
   * ----------------------------------
   * Memiliki logika yang mirip dengan kategori pelanggan
   * tetapi dikhususkan untuk marketplace
   */
  const addMarketplaceCategory = () => {
    const newCategory: PriceCategory = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
      order: marketplaceCategories.length,
    };
    setMarketplaceCategories([...marketplaceCategories, newCategory]);
  };

  const removeMarketplaceCategory = (id: string) => {
    if (marketplaceCategories.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must have at least one marketplace category',
      });
      return;
    }
    setMarketplaceCategories(marketplaceCategories.filter(cat => cat.id !== id));
    localStorage.setItem('marketplaceCategories', JSON.stringify(
      marketplaceCategories.filter(cat => cat.id !== id)
    ));
  };

  const updateMarketplaceCategory = (id: string, field: keyof PriceCategory, value: string | number) => {
    const updatedCategories = marketplaceCategories.map(cat => {
      if (cat.id === id) {
        return {
          ...cat,
          [field]: field === 'percentage' ? Number(value) || 0 : value || '',
        };
      }
      return cat;
    });
    setMarketplaceCategories(updatedCategories);
    localStorage.setItem('marketplaceCategories', JSON.stringify(updatedCategories));
  };

  /**
   * saveAllCategories
   * ----------------
   * Menyimpan semua perubahan:
   * 1. Kategori pelanggan
   * 2. Kategori marketplace
   * 3. Menampilkan notifikasi sukses
   */
  const saveAllCategories = () => {
    localStorage.setItem('priceCategories', JSON.stringify(categories));
    localStorage.setItem('marketplaceCategories', JSON.stringify(marketplaceCategories));
    toast({
      title: 'Success',
      description: 'All categories have been saved successfully',
    });
  };

  /**
   * Render Komponen
   * -------------
   * Struktur UI:
   * 1. Header dengan judul dan deskripsi
   * 2. Card kategori pelanggan
   *    - Daftar kategori yang dapat diedit
   * 3. Card kategori marketplace
   *    - Daftar marketplace yang dapat diedit
   * 4. Tombol simpan di bagian bawah
   */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Price Categories</h1>
        <p className="text-muted-foreground">
          Manage your customer price categories and their multipliers
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Categories</CardTitle>
              <CardDescription>
                Define your pricing tiers and their respective multipliers.
              </CardDescription>
            </div>
            <Button onClick={addCategory} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-card"
              >
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      value={category.name || ''} // Ensure value is never undefined
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      placeholder="e.g., Basic, Elite"
                      className="h-9"
                    />
                    <div className="text-xs text-muted-foreground pl-2">
                      Formula: HB Naik + {category.percentage}% markup
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={category.percentage || 0} // Ensure value is never undefined
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          updateCategory(category.id, 'percentage', value ? parseInt(value) : 0);
                        }}
                        placeholder="Enter percentage"
                        className="h-9"
                      />
                      <span className="text-xs text-muted-foreground pl-2">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeCategory(category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Marketplace Categories</CardTitle>
              <CardDescription>
                Define your marketplace pricing tiers and their respective multipliers.
              </CardDescription>
            </div>
            <Button onClick={addMarketplaceCategory} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {marketplaceCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-card"
              >
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      value={category.name || ''}
                      onChange={(e) => updateMarketplaceCategory(category.id, 'name', e.target.value)}
                      placeholder="e.g., Shopee, Tokopedia"
                      className="h-9"
                    />
                    <div className="text-xs text-muted-foreground pl-2">
                      Formula: HB Naik + {category.percentage}% markup
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={category.percentage || 0}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          updateMarketplaceCategory(category.id, 'percentage', value ? parseInt(value) : 0);
                        }}
                        placeholder="Enter percentage"
                        className="h-9"
                      />
                      <span className="text-xs text-muted-foreground pl-2">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeMarketplaceCategory(category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAllCategories} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}