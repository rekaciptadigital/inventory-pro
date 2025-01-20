import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as brandApi from "@/lib/api/brands";
import type { Brand } from "@/types/brand";

interface UseBrandsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useBrands(options: UseBrandsOptions = {}) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data,
    error,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ["brands", options],
    queryFn: () => brandApi.getBrands(options),
  });

  const createBrand = async (formData: brandApi.BrandFormData) => {
    setIsLoading(true);
    try {
      await brandApi.createBrand(formData);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBrand = async ({
    id,
    data: formData,
  }: {
    id: number;
    data: brandApi.BrandFormData;
  }) => {
    setIsLoading(true);
    try {
      await brandApi.updateBrand(id, formData);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBrand = async (id: string) => {
    setIsLoading(true);
    try {
      await brandApi.deleteBrand(Number(id));
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBrandStatus = async (id: string, status: boolean) => {
    setIsLoading(true);
    try {
      await brandApi.updateBrandStatus(Number(id), status);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    brands: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoading || isLoadingQuery,
    error,
    getBrands: brandApi.getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
  };
}
