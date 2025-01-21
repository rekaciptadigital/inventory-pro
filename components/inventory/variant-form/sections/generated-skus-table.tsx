"use client";

import { useState, useMemo } from "react";
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
import type { SelectedVariant } from "@/types/variant";

interface GeneratedSkusTableProps {
  baseSku: string;
  selectedVariants: SelectedVariant[];
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
}: GeneratedSkusTableProps) {
  const { data: variantTypesResponse, isLoading, error } = useVariantTypes();
  const [variantCodes, setVariantCodes] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const variantTypes = variantTypesResponse?.data ?? [];

  // Generate combinations of variant values
  const generateCombinations = (variants: SelectedVariant[]) => {
    if (variants.length === 0) return [[]];

    const [first, ...rest] = variants;
    const restCombinations = generateCombinations(rest);

    return first.values.flatMap((value) =>
      restCombinations.map((combo) => [value, ...combo])
    );
  };

  const combinations = generateCombinations(
    selectedVariants.filter((v) => v.values.length > 0)
  );

  if (isLoading) {
    return <div>Loading variant types...</div>;
  }

  if (error) {
    return <div>Error loading variant types</div>;
  }

  if (!baseSku || combinations.length === 0) return null;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Variant Combination</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combo, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {baseSku}-{combo.join("-")}
              </TableCell>
              <TableCell>
                {combo.map((value, i) => (
                  <span key={i}>
                    {selectedVariants[i]?.typeId ? `${value}` : value}
                    {i < combo.length - 1 ? " / " : ""}
                  </span>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
