'use client';

import { useState, useEffect } from 'react';
import type { PriceCategory } from '@/types/settings';

const defaultCategories: PriceCategory[] = [
  { id: '1', name: 'Platinum', multiplier: 1.45, order: 0 },
  { id: '2', name: 'Gold', multiplier: 1.03, order: 1 },
  { id: '3', name: 'Silver', multiplier: 1.05, order: 2 },
  { id: '4', name: 'Bronze', multiplier: 1.05, order: 3 },
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