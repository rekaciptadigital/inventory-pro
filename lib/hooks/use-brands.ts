import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Brand } from "@/types/brand";
import type { ApiResponse } from "@/types/api";

export interface BrandFilters {
  search?: string;
  status?: boolean;
  page?: number;
  limit?: number;
}

export function useBrands(filters: BrandFilters = {}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize brands in localStorage if not exists
  const initializeBrands = useCallback(() => {
    const savedBrands = localStorage.getItem('brands');
    if (!savedBrands) {
      const defaultBrands: Brand[] = [
        {
          id: '1',
          name: 'Hoyt',
          code: 'HYT',
          description: 'Hoyt Archery',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Win & Win',
          code: 'WNW',
          description: 'Win & Win Archery',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem('brands', JSON.stringify(defaultBrands));
      return defaultBrands;
    }
    return JSON.parse(savedBrands);
  }, []);

  const getBrands = useCallback(async (filters: BrandFilters = {}): Promise<ApiResponse<Brand[]>> => {
    try {
      setIsLoading(true);
      
      // Get or initialize brands
      let brands = initializeBrands();
      
      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        brands = brands.filter(brand => 
          brand.name.toLowerCase().includes(searchTerm) ||
          brand.code.toLowerCase().includes(searchTerm)
        );
      }
      
      if (typeof filters.status === 'boolean') {
        brands = brands.filter(brand => brand.status === filters.status);
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedBrands = brands.slice(start, end);
      
      // Add artificial delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        status: { code: 200, message: 'Success' },
        data: paginatedBrands,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(brands.length / limit),
          pageSize: limit,
          totalItems: brands.length,
        }
      };
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new Error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, [initializeBrands]);

  const createBrand = useCallback(async (data: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      const brands = initializeBrands();
      
      // Check for duplicate name or code
      if (brands.some(b => b.name.toLowerCase() === data.name.toLowerCase())) {
        throw new Error('A brand with this name already exists');
      }
      if (brands.some(b => b.code === data.code)) {
        throw new Error('A brand with this code already exists');
      }

      const newBrand: Brand = {
        id: (brands.length + 1).toString(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      brands.push(newBrand);
      localStorage.setItem('brands', JSON.stringify(brands));

      return {
        status: { code: 200, message: 'Success' },
        data: newBrand,
      };
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initializeBrands]);

  return {
    getBrands,
    createBrand,
    isLoading,
  };
}