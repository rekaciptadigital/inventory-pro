"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VariantSkuField } from "./variant-sku-field";
import {
  generateVariantCombinations,
  formatVariantName,
  type VariantCombination,
} from "@/lib/utils/variant/combinations";
import { useVariantTypes } from "@/lib/hooks/use-variant-types";
import { generateSequentialCode } from "@/lib/utils/sku/variant-code-generator";

interface GeneratedSkusTableProps {
  baseSku: string;
  selectedVariants: Array<{ typeId: string; values: string[] }>;
  productDetails: {
    brand: string;
    productType: string;
    productName: string;
  };
}

/**
 * Interface untuk data baris varian dalam tabel
 * Menyimpan informasi SKU, kode unik, dan harga untuk setiap kombinasi
 */
interface VariantRow {
  mainSku: string;
  uniqueCode: string;
  defaultUniqueCode: string;
  combination: VariantCombination;
}

/**
 * Komponen untuk menampilkan tabel SKU yang digenerate
 * Menampilkan kombinasi varian dengan SKU dan harga masing-masing
 * Memungkinkan pengguna untuk mengubah kode unik dan mereset ke default
 */
export function GeneratedSkusTable({
  baseSku,
  selectedVariants,
  productDetails,
}: Readonly<GeneratedSkusTableProps>) {
  const { data: variantTypesResponse, isLoading, error } = useVariantTypes();
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const variantTypes = variantTypesResponse?.data ?? [];

  // Memoize combinations to prevent unnecessary recalculations
  const combinations = useMemo(() => {
    if (!baseSku || selectedVariants.length === 0) return [];
    return generateVariantCombinations(selectedVariants, variantTypes);
  }, [baseSku, selectedVariants, variantTypes]);

  // Memoize variants generation
  const newVariants = useMemo(() => {
    if (combinations.length === 0) return [];

    return combinations.map((combination, index) => {
      const defaultCode = generateSequentialCode(index);
      return {
        mainSku: baseSku,
        uniqueCode: defaultCode,
        defaultUniqueCode: defaultCode,
        combination,
      };
    });
  }, [combinations, baseSku]);

  // Update variants state when new variants are generated
  useEffect(() => {
    setVariants(newVariants);
  }, [newVariants]);

  /**
   * Handler untuk perubahan kode unik
   * Memperbarui state variants dengan kode unik baru
   */
  const handleUniqueCodeChange = (index: number, newCode: string) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[index] = {
        ...newVariants[index],
        uniqueCode: newCode,
      };
      return newVariants;
    });
  };

  /**
   * Handler untuk mereset kode unik ke nilai default
   */
  const handleReset = (index: number) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[index] = {
        ...newVariants[index],
        uniqueCode: newVariants[index].defaultUniqueCode,
      };
      return newVariants;
    });
  };

  if (isLoading) {
    return <div>Loading variant types...</div>;
  }

  if (error) {
    return <div>Error loading variant types</div>;
  }

  if (!baseSku || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Full Product Name</TableHead>
            <TableHead>SKU & Unique Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant, index) => {
            // Create unique key using combination values details
            const variantKey = `${variant.mainSku}-${variant.combination.values
              .map((v) => `${v.typeId}-${v.valueName}`)
              .join("-")}`;

            return (
              <TableRow key={variantKey}>
                <TableCell>
                  {formatVariantName(
                    productDetails.brand,
                    productDetails.productType,
                    productDetails.productName,
                    variant.combination
                  )}
                </TableCell>
                <TableCell>
                  <VariantSkuField
                    index={index}
                    mainSku={variant.mainSku}
                    uniqueCode={variant.uniqueCode}
                    defaultUniqueCode={variant.defaultUniqueCode}
                    existingCodes={variants.map((v) => v.uniqueCode)}
                    onUniqueCodeChange={(code) =>
                      handleUniqueCodeChange(index, code)
                    }
                    onReset={() => handleReset(index)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
