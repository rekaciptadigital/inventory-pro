'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types/inventory';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const getFilteredProducts = (
    brandId?: string,
    productTypeId?: string,
    searchTerm: string = ''
  ): Product[] => {
    return products
      .filter(product => {
        const matchesBrand = !brandId || product.brand === brandId;
        const matchesType = !productTypeId || product.productTypeId === productTypeId;
        const matchesSearch = product.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const isBaseProduct = !product.variants || product.variants.length === 0;
        
        return matchesBrand && matchesType && matchesSearch && isBaseProduct;
      })
      .slice(0, 10); // Limit to 10 results
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  return {
    products,
    getFilteredProducts,
    getProductById
  };
}