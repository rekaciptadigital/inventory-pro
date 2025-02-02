'use client';

import { useState, useEffect } from 'react';
import type { InventoryProduct } from '@/types/inventory';

export function useProducts() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);

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
  ): InventoryProduct[] => {
    return products
      .filter(product => {
        const matchesBrand = !brandId || product.brand_id === brandId;
        const matchesType = !productTypeId || product.product_type_id === productTypeId;
        const matchesSearch = product.product_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const isBaseProduct = !product.variants || product.variants.length === 0;
        
        return matchesBrand && matchesType && matchesSearch && isBaseProduct;
      })
      .slice(0, 10); // Limit to 10 results
  };

  const getProductById = (id: string): InventoryProduct | undefined => {
    const dummyProduct: InventoryProduct = {
      id: parseInt(id),
      created_at: "2025-01-15 04:03:55",
      updated_at: "2025-01-15 04:03:55",
      deleted_at: null,
      brand_id: "15",
      brand_code: "AR",
      brand_name: "ARCHON",
      product_type_id: "1",
      product_type_code: "PB0001",
      product_type_name: "Bow",
      unique_code: "",
      sku: "ARPB0001",
      product_name: "scutter",
      full_product_name: "ARCHON Bow Scutter",
      vendor_sku: "VENUS123",
      description: "High quality bow",
      unit: "Piece",
      slug: "scutter",
      product_by_variant: [
        {
          id: "bfac363c6ae5f01d280e8591",
          created_at: "2025-01-15 04:03:55",
          updated_at: "2025-01-15 04:03:55",
          inventory_product_id: 4,
          full_product_name: "ARCHON Bow Scutter Red",
          sku_product_variant: "ARPB0001-001",
          sku_product_unique_code: 1,
          deleted_at: null
        },
        {
          id: "166420ec837b3d21cf54e894",
          created_at: "2025-01-15 04:03:55",
          updated_at: "2025-01-15 04:03:55",
          inventory_product_id: 4,
          full_product_name: "ARCHON Bow Scutter Silver",
          sku_product_variant: "ARPB0001-002",
          sku_product_unique_code: 2,
          deleted_at: null
        }
      ],
      usdPrice: 100,
      exchangeRate: 15000,
      hbReal: 1500000,
      adjustmentPercentage: 10,
      hbNaik: 1650000,
      categories: [
        {
          id: 1,
          created_at: "2025-01-15 04:03:55",
          inventory_product_id: 4,
          product_category_id: "10",
          product_category_parent: null,
          product_category_name: "Archery",
          category_hierarchy: 1
        }
      ],
      variants: [
        {
          id: 1,
          created_at: "2025-01-15 04:03:55",
          inventory_product_id: 4,
          variant_id: "3",
          variant_name: "Color",
          values: [
            {
              id: 1,
              created_at: "2025-01-15 04:03:55",
              inventory_product_variant_id: 4,
              variant_value_id: "59",
              variant_value_name: "Red"
            }
          ]
        }
      ]
    };

    return dummyProduct;
  };

  return {
    products,
    getFilteredProducts,
    getProductById
  };
}