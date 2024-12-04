import { useState, useEffect } from 'react';
import type { Tax } from '@/types/tax';

export function useTaxes() {
  const [taxes, setTaxes] = useState<Tax[]>([]);

  useEffect(() => {
    const savedTaxes = localStorage.getItem('taxes');
    if (savedTaxes) {
      setTaxes(JSON.parse(savedTaxes));
    }
  }, []);

  const addTax = async (data: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tax> => {
    return new Promise((resolve, reject) => {
      try {
        // Check for duplicate names
        if (taxes.some(tax => tax.name.toLowerCase() === data.name.toLowerCase())) {
          throw new Error('A tax with this name already exists');
        }

        const newTax: Tax = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedTaxes = [...taxes, newTax];
        setTaxes(updatedTaxes);
        localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
        resolve(newTax);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateTax = async (id: string, data: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tax> => {
    return new Promise((resolve, reject) => {
      try {
        // Check for duplicate names
        if (taxes.some(tax => 
          tax.id !== id && tax.name.toLowerCase() === data.name.toLowerCase()
        )) {
          throw new Error('A tax with this name already exists');
        }

        const updatedTaxes = taxes.map(tax => {
          if (tax.id === id) {
            return {
              ...tax,
              ...data,
              updatedAt: new Date().toISOString(),
            };
          }
          return tax;
        });

        setTaxes(updatedTaxes);
        localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
        resolve(updatedTaxes.find(tax => tax.id === id)!);
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteTax = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const updatedTaxes = taxes.filter(tax => tax.id !== id);
      setTaxes(updatedTaxes);
      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
      resolve();
    });
  };

  return {
    taxes,
    addTax,
    updateTax,
    deleteTax,
  };
}