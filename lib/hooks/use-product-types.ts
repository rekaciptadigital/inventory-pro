"use client";

import { useState, useEffect } from "react";
import type { ProductType } from "@/types/product-type";

interface GetProductTypesParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface ProductTypeResponse {
  status: {
    code: number;
    message: string;
  };
  data: Array<{
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    name: string;
    code: string;
    description: string;
    status: boolean;
  }>;
  pagination: {
    links: {
      first: string;
      previous: string | null;
      current: string;
      next: string | null;
      last: string;
    };
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeProductTypes = () => {
      const savedProductTypes = localStorage.getItem("productTypes");
      if (savedProductTypes) {
        const parsed = JSON.parse(savedProductTypes);
        setProductTypes(parsed);
      } else {
        // Initialize with default product types if none exist
        const defaultTypes = [
          {
            id: "1",
            name: "Arrow",
            code: "AR",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Bow",
            code: "BW",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Accessory",
            code: "AC",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setProductTypes(defaultTypes);
        localStorage.setItem("productTypes", JSON.stringify(defaultTypes));
      }
      setIsLoading(false);
    };

    initializeProductTypes();
  }, []);

  const addProductType = (name: string, code: string): Promise<ProductType> => {
    return new Promise((resolve, reject) => {
      // Check for duplicate names
      if (
        productTypes.some(
          (type) => type.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        reject(new Error("A product type with this name already exists"));
        return;
      }

      // Check for duplicate codes
      if (productTypes.some((type) => type.code === code)) {
        reject(new Error("A product type with this code already exists"));
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
      localStorage.setItem("productTypes", JSON.stringify(updatedTypes));
      resolve(newProductType);
    });
  };

  const updateProductType = (
    id: string,
    name: string,
    code: string
  ): Promise<ProductType> => {
    return new Promise((resolve, reject) => {
      // Check for duplicate names, excluding the current type
      if (
        productTypes.some(
          (type) =>
            type.id !== id && type.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        reject(new Error("A product type with this name already exists"));
        return;
      }

      // Check for duplicate codes, excluding the current type
      if (productTypes.some((type) => type.id !== id && type.code === code)) {
        reject(new Error("A product type with this code already exists"));
        return;
      }

      const updatedTypes = productTypes.map((type) => {
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
      localStorage.setItem("productTypes", JSON.stringify(updatedTypes));
      resolve(updatedTypes.find((type) => type.id === id)!);
    });
  };

  const deleteProductType = (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const updatedTypes = productTypes.filter((type) => type.id !== id);
      setProductTypes(updatedTypes);
      localStorage.setItem("productTypes", JSON.stringify(updatedTypes));
      resolve();
    });
  };

  const getProductTypeName = (typeId: string): string => {
    const productType = productTypes.find((type) => type.id === typeId);
    return productType?.name || "Unknown Type";
  };

  const getProductTypes = async ({
    search = "",
    page = 1,
    limit = 10,
  }: GetProductTypesParams): Promise<ProductTypeResponse> => {
    // Simulate API pagination
    const filteredTypes = productTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(search.toLowerCase()) ||
        type.code.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

    return {
      status: {
        code: 200,
        message: "Success",
      },
      data: paginatedTypes.map((type) => ({
        id: parseInt(type.id),
        created_at: type.createdAt,
        updated_at: type.updatedAt,
        deleted_at: null,
        name: type.name,
        code: type.code,
        description: "",
        status: true,
      })),
      pagination: {
        links: {
          first: "",
          previous: null,
          current: "",
          next: null,
          last: "",
        },
        currentPage: page,
        totalPages: Math.ceil(filteredTypes.length / limit),
        pageSize: limit,
        totalItems: filteredTypes.length,
        hasNext: endIndex < filteredTypes.length,
        hasPrevious: startIndex > 0,
      },
    };
  };

  return {
    productTypes,
    isLoading,
    addProductType,
    updateProductType,
    deleteProductType,
    getProductTypeName,
    getProductTypes,
  };
}
