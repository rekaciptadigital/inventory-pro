'use client';

/**
 * Modul Pengaturan Kategori Harga
 * ---------------------------
 * Modul ini menangani manajemen kategori harga untuk produk.
 * Setiap kategori memiliki nama dan persentase markup harga.
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
 * Memastikan nama kategori tidak kosong dan multiplier lebih dari 0
 */
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  multiplier: z.number().min(0.01, 'Multiplier must be greater than 0'),
});

/**
 * Komponen Utama Halaman Kategori
 * -------------------------------
 * Menampilkan dan mengelola daftar kategori harga
 * dengan kemampuan CRUD (Create, Read, Update, Delete)
 */
export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<PriceCategory[]>([]);

  /**
   * Effect Hook untuk Inisialisasi Data
   * ----------------------------------
   * Mengambil data kategori dari localStorage saat komponen dimuat
   * Jika tidak ada data, akan membuat kategori default
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
  }, []);

  /**
   * Fungsi Pengelolaan Kategori
   * ---------------------------
   */

  /** Menambah kategori baru dengan nilai default */
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
   * Menghapus kategori berdasarkan ID
   * Mencegah penghapusan jika hanya tersisa 1 kategori
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
   * Memperbarui data kategori
   * @param id - ID kategori yang akan diupdate
   * @param field - Field yang akan diubah (name/percentage)
   * @param value - Nilai baru
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
   * Menyimpan perubahan kategori
   * Saat ini hanya menyimpan ke localStorage
   * TODO: Implementasi penyimpanan ke backend
   */
  const saveCategories = () => {
    // Here you would typically save to your backend
    localStorage.setItem('priceCategories', JSON.stringify(categories));
    toast({
      title: 'Success',
      description: 'Categories have been saved successfully',
    });
  };

  /**
   * Render Komponen
   * --------------
   * Struktur tampilan:
   * 1. Header halaman
   * 2. Card container
   *    - Header card dengan tombol tambah
   *    - Daftar kategori
   *      - Input nama kategori
   *      - Input persentase
   *      - Tombol hapus
   * 3. Tombol simpan
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

          <div className="mt-6 flex justify-end">
            <Button onClick={saveCategories}>Save Categories</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}