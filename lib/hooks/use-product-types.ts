'use client';

import { useState, useEffect } from 'react';
import type { ProductType } from '@/types/product-type';

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    const savedProductTypes = localStorage.getItem('productTypes');
    if (savedProductTypes) {
      setProductTypes(JSON.parse(savedProductTypes));
    }
  }, []);

  const addProductType = (name: string, code: string): Promise<ProductType> => {
    return new Promise((resolve, reject) => {
      // Check for duplicate names
      if (productTypes.some(type => type.name.toLowerCase() === name.toLowerCase())) {
        reject(new Error('A product type with this name already exists'));
        return;
      }

      // Check for duplicate codes
      if (productTypes.some(type => type.code === code)) {
        reject(new Error('A product type with this code already exists'));
        return;
      }

      const newProductType: ProductType = {
        id: Date.now().toString(),
        name,
        code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTypes = [...productTypes, newProductType];
      setProductTypes(updatedTypes);
      localStorage.setItem('productTypes', JSON.stringify(updatedTypes));
      resolve(newProductType);
    });
  };

  const updateProductType = (id: string, name: string, code: string): Promise<ProductType> => {
    return new Promise((resolve, reject) => {
      // Check for duplicate names, excluding the current type
      if (productTypes.some(type => 
        type.id !== id && type.name.toLowerCase() === name.toLowerCase()
      )) {
        reject(new Error('A product type with this name already exists'));
        return;
      }

      // Check for duplicate codes, excluding the current type
      if (productTypes.some(type => 
        type.id !== id && type.code === code
      )) {
        reject(new Error('A product type with this code already exists'));
        return;
      }

      const updatedTypes = productTypes.map(type => {
        if (type.id === id) {
          return {
            ...type,
            name,
            code,
            updatedAt: new Date().toISOString(),
          };
        }
        return type;
      });

      setProductTypes(updatedTypes);
      localStorage.setItem('productTypes', JSON.stringify(updatedTypes));
      resolve(updatedTypes.find(type => type.id === id)!);
    });
  };

  const deleteProductType = (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const updatedTypes = productTypes.filter(type => type.id !== id);
      setProductTypes(updatedTypes);
      localStorage.setItem('productTypes', JSON.stringify(updatedTypes));
      resolve();
    });
  };

  const getProductTypeName = (typeId: string): string => {
    const productType = productTypes.find(type => type.id === typeId);
    return productType?.name || 'Unknown Type';
  };

  return {
    productTypes,
    addProductType,
    updateProductType,
    deleteProductType,
    getProductTypeName,
  };
}