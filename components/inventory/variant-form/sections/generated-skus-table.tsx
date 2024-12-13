'use client';

import { useState, useEffect } from 'react';
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
import { formatCurrency } from '@/lib/utils/format';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { generateSequentialCode } from '@/lib/utils/sku/variant-code-generator';

interface GeneratedSkusTableProps {
  baseSku: string;
  basePrice: number;
  selectedVariants: Array<{ typeId: string; values: string[] }>;
  onPriceChange: (sku: string, price: number) => void;
  productDetails: {
    brand: string;
    productType: string;
    productName: string;
  };
}

interface VariantRow {
  mainSku: string;
  uniqueCode: string;
  defaultUniqueCode: string;
  combination: VariantCombination;
  price: number;
}

export function GeneratedSkusTable({
  baseSku,
  basePrice,
  selectedVariants,
  onPriceChange,
  productDetails,
}: GeneratedSkusTableProps) {
  const { variantTypes } = useVariantTypes();
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!baseSku || selectedVariants.length === 0) return;

    // Generate all possible combinations
    const combinations = generateVariantCombinations(selectedVariants, variantTypes);

    // Generate variants with sequential codes
    const newVariants = combinations.map((combination, index) => {
      const defaultCode = generateSequentialCode(index);
      return {
        mainSku: baseSku,
        uniqueCode: defaultCode,
        defaultUniqueCode: defaultCode,
        combination,
        price: basePrice,
      };
    });

    setVariants(newVariants);
  }, [baseSku, selectedVariants, variantTypes]);

  const handleUniqueCodeChange = (index: number, newCode: string) => {
    setVariants(prev => {
      const newVariants = [...prev];
      newVariants[index] = {
        ...newVariants[index],
        uniqueCode: newCode,
      };
      return newVariants;
    });
  };

  const handleReset = (index: number) => {
    setVariants(prev => {
      const newVariants = [...prev];
      newVariants[index] = {
        ...newVariants[index],
        uniqueCode: newVariants[index].defaultUniqueCode,
      };
      return newVariants;
    });
  };

  if (!baseSku || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Full Product Name</TableHead>
            <TableHead>SKU & Unique Code</TableHead>
            <TableHead className="w-[200px]">Base Value (HB)</TableHead>
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
              <TableCell>
                {formatCurrency(variant.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}