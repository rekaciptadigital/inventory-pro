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
import { VariantSkuInput } from './variant-sku-input';
import { 
  generateVariantCode, 
  formatVariantSku,
  isUniqueVariantCode,
  generateSequentialCode
} from '@/lib/utils/sku/variant-code-generator';
import { 
  generateVariantCombinations,
  formatVariantName,
  type VariantCombination 
} from '@/lib/utils/variant/combinations';
import { formatCurrency } from '@/lib/utils/format';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

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
    const existingCodes = variants.map(v => v.uniqueCode);
    const newVariants = combinations.map((combination, index) => {
      const { mainSku, uniqueCode } = generateVariantCode(
        baseSku, 
        existingCodes,
        index // Pass index for sequential numbering
      );
      existingCodes.push(uniqueCode);
      
      return {
        mainSku,
        uniqueCode,
        combination,
        price: basePrice,
      };
    });

    setVariants(newVariants);
  }, [baseSku, selectedVariants, variantTypes]);

  const handleCodeChange = (index: number, newCode: string) => {
    if (!newCode) {
      setErrors(prev => ({ ...prev, [index]: 'Code is required' }));
      return;
    }

    // Check uniqueness within current variants
    const isUnique = isUniqueVariantCode(
      newCode,
      baseSku,
      variants.map(v => ({ sku: formatVariantSku({ mainSku: v.mainSku, uniqueCode: v.uniqueCode }) }))
    );

    if (!isUnique) {
      setErrors(prev => ({ ...prev, [index]: 'Code must be unique' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setVariants(prev => {
      const newVariants = [...prev];
      newVariants[index] = {
        ...newVariants[index],
        uniqueCode: newCode,
      };
      return newVariants;
    });
  };

  if (!baseSku || variants.length === 0) return null;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Full Product Name</TableHead>
            <TableHead>SKU Variant</TableHead>
            <TableHead>Unique Code</TableHead>
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
              <TableCell className="font-mono">
                {formatVariantSku({ mainSku: variant.mainSku, uniqueCode: variant.uniqueCode })}
              </TableCell>
              <TableCell>
                <VariantSkuInput
                  value={variant.uniqueCode}
                  onChange={(value) => handleCodeChange(index, value)}
                  error={errors[index]}
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