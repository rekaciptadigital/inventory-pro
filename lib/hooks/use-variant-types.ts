'use client';

import { useState, useEffect } from 'react';
import type { VariantType, VariantValue } from '@/types/variant';

export function useVariantTypes() {
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  useEffect(() => {
    const savedVariantTypes = localStorage.getItem('variantTypes');
    if (savedVariantTypes) {
      setVariantTypes(JSON.parse(savedVariantTypes));
    }
  }, []);

  const addVariantType = (
    name: string, 
    status: 'active' | 'inactive',
    values: Omit<VariantValue, 'id' | 'variantTypeId'>[],
    order: number
  ): Promise<VariantType> => {
    return new Promise((resolve, reject) => {
      if (variantTypes.some(type => type.name.toLowerCase() === name.toLowerCase())) {
        reject(new Error('A variant type with this name already exists'));
        return;
      }

      const newVariantType: VariantType = {
        id: Date.now().toString(),
        name,
        status,
        order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        values: values.map((value, index) => ({
          ...value,
          id: `${Date.now()}-${index}`,
          variantTypeId: Date.now().toString(),
        })),
      };

      const updatedTypes = [...variantTypes, newVariantType];
      setVariantTypes(updatedTypes);
      localStorage.setItem('variantTypes', JSON.stringify(updatedTypes));
      resolve(newVariantType);
    });
  };

  const updateVariantType = (
    id: string,
    name: string,
    status: 'active' | 'inactive',
    values: Omit<VariantValue, 'id' | 'variantTypeId'>[],
    order: number
  ): Promise<VariantType> => {
    return new Promise((resolve, reject) => {
      if (variantTypes.some(type => 
        type.id !== id && type.name.toLowerCase() === name.toLowerCase()
      )) {
        reject(new Error('A variant type with this name already exists'));
        return;
      }

      const updatedTypes = variantTypes.map(type => {
        if (type.id === id) {
          return {
            ...type,
            name,
            status,
            order,
            updatedAt: new Date().toISOString(),
            values: values.map((value, index) => ({
              ...value,
              id: `${Date.now()}-${index}`,
              variantTypeId: id,
            })),
          };
        }
        return type;
      });

      setVariantTypes(updatedTypes);
      localStorage.setItem('variantTypes', JSON.stringify(updatedTypes));
      resolve(updatedTypes.find(type => type.id === id)!);
    });
  };

  const deleteVariantType = (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const updatedTypes = variantTypes.filter(type => type.id !== id);
      setVariantTypes(updatedTypes);
      localStorage.setItem('variantTypes', JSON.stringify(updatedTypes));
      resolve();
    });
  };

  const getActiveVariantTypes = () => {
    return variantTypes.filter(type => type.status === 'active');
  };

  return {
    variantTypes,
    addVariantType,
    updateVariantType,
    deleteVariantType,
    getActiveVariantTypes,
  };
}