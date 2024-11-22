'use client';

import { useState, useEffect } from 'react';
import type { Brand } from '@/types/brand';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const savedBrands = localStorage.getItem('brands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    }
  }, []);

  const getBrandName = (brandId: string): string => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'Unknown Brand';
  };

  return {
    brands,
    setBrands,
    getBrandName,
  };
}