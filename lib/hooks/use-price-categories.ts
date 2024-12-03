'use client';

import { useState, useEffect } from 'react';
import type { PriceCategory } from '@/types/settings';

const defaultCategories: PriceCategory[] = [
  { id: '1', name: 'Elite', percentage: 10, order: 0 },
  { id: '2', name: 'Super', percentage: 20, order: 1 },
  { id: '3', name: 'Basic', percentage: 30, order: 2 },
];

export function usePriceCategories() {
  const [categories, setCategories] = useState<PriceCategory[]>(defaultCategories);

  useEffect(() => {
    const savedCategories = localStorage.getItem('priceCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  return {
    categories,
    setCategories,
  };
}