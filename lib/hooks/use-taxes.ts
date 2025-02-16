import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/services/api';
import type { Tax } from '@/types/tax';

interface TaxResponse {
  status: {
    code: number;
    message: string;
  };
  data: Tax;
}

export function useTaxes() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTaxes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<TaxResponse>('/taxes/1');
      if (response.data.status.code === 200) {
        setTaxes([response.data.data]);
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load tax settings',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateTax = async (id: string, data: Partial<Tax>): Promise<void> => {
    try {
      const response = await api.put<TaxResponse>(`/taxes/${id}`, {
        name: data.name || 'PPN',
        description: data.description || 'Pajak Pertambahan Nilai',
        percentage: Number(data.percentage?.toFixed(2)),
        status: data.status,
      });

      if (response.data.status.code === 200) {
        setTaxes(prev => prev.map(tax => 
          tax.id === id ? response.data.data : tax
        ));
        return;
      }
      throw new Error('Failed to update tax');
    } catch (error) {
      console.error('Error updating tax:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  return {
    taxes,
    updateTax,
    isLoading,
  };
}