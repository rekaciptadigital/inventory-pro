'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VariantSkuField } from './variant-sku-field';
import { 
  generateVariantCombinations,
  formatVariantName,
  type VariantCombination 
} from '@/lib/utils/variant/combinations';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { generateSequentialCode } from '@/lib/utils/sku/variant-code-generator';

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
}: GeneratedSkusTableProps) {
  const { data: variantTypesResponse, isLoading, error } = useVariantTypes();
  const [variantCodes, setVariantCodes] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const variantTypes = variantTypesResponse?.data ?? [];

  // Memoize combinations to prevent unnecessary recalculations
  const combinations = useMemo(() => {
    if (!baseSku || selectedVariants.length === 0) return [];
    return generateVariantCombinations(selectedVariants, variantTypes);
  }, [baseSku, selectedVariants, variantTypes]);

  // Memoize variants generation
  const variants = useMemo(() => {
    if (combinations.length === 0) return [];
    
    return combinations.map((combination, index) => {
      const defaultCode = generateSequentialCode(index);
      return {
        mainSku: baseSku,
        uniqueCode: variantCodes[index] || defaultCode,
        defaultUniqueCode: defaultCode,
        combination,
      };
    });
  }, [combinations, baseSku, variantCodes]);

  const handleUniqueCodeChange = (index: number, newCode: string) => {
    setVariantCodes(prev => ({
      ...prev,
      [index]: newCode
    }));
  };

  const handleReset = (index: number) => {
    setVariantCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[index];
      return newCodes;
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
          {variants.map((variant, index) => (
            <TableRow key={index}>
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
                  existingCodes={variants.map(v => v.uniqueCode)}
                  error={errors[index]}
                  onUniqueCodeChange={(code) => handleUniqueCodeChange(index, code)}
                  onReset={() => handleReset(index)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}