'use client';

import { useState, useEffect } from 'react';
import type { PriceCategory } from '@/types/settings';

const defaultCategories: PriceCategory[] = [
  { id: '1', name: 'Elite', multiplier: 1.1, order: 0 },
  { id: '2', name: 'Super', multiplier: 1.2, order: 1 },
  { id: '3', name: 'Basic', multiplier: 1.3, order: 2 },
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