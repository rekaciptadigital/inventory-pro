'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { formatCurrency } from '@/lib/utils/format';
import { generateVariantName } from '@/lib/utils/variant-name-generator';

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

export function GeneratedSkusTable({
  baseSku,
  basePrice,
  selectedVariants,
  onPriceChange,
  productDetails,
}: GeneratedSkusTableProps) {
  const { variantTypes } = useVariantTypes();
  const [prices, setPrices] = useState<Record<string, number>>({});

  if (!baseSku || selectedVariants.length === 0) return null;

  const getVariantInfo = (variantCodes: string) => {
    const variantInfo = selectedVariants.map(variant => {
      const variantType = variantTypes.find(t => t.id === variant.typeId);
      if (!variantType) return null;

      const selectedValues = variant.values
        .map(valueId => {
          const value = variantType.values.find(v => v.id === valueId);
          if (value && variantCodes.includes(value.code)) {
            return value.name;
          }
          return null;
        })
        .filter(Boolean);

      return {
        type: variantType.name,
        values: selectedValues,
      };
    }).filter(Boolean);

    return variantInfo;
  };

  const handlePriceChange = (sku: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      setPrices(prev => ({ ...prev, [sku]: numericValue }));
      onPriceChange(sku, numericValue);
    }
  };

  const skus = generateSkuCombinations(baseSku, selectedVariants, variantTypes);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Full Product Name</TableHead>
            <TableHead>SKU Variant</TableHead>
            <TableHead className="w-[200px]">Base Value (HB)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skus.map(({ sku, variantCodes }) => {
            const variantInfo = getVariantInfo(variantCodes);
            const fullName = generateVariantName(
              productDetails.brand,
              productDetails.productType,
              productDetails.productName,
              variantInfo
            );

            return (
              <TableRow key={sku}>
                <TableCell>{fullName}</TableCell>
                <TableCell className="font-mono">{sku}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={prices[sku] || basePrice}
                    onChange={(e) => handlePriceChange(sku, e.target.value)}
                    className="w-full"
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

function generateSkuCombinations(
  baseSku: string,
  selectedVariants: Array<{ typeId: string; values: string[] }>,
  variantTypes: Array<any>
) {
  const combinations: Array<{ sku: string; variantCodes: string }> = [];
  
  function generateCombinations(
    currentSku: string,
    currentCodes: string,
    variantIndex: number
  ) {
    if (variantIndex === selectedVariants.length) {
      combinations.push({ sku: currentSku, variantCodes: currentCodes });
      return;
    }

    const variant = selectedVariants[variantIndex];
    const variantType = variantTypes.find(t => t.id === variant.typeId);
    
    if (!variantType) return;

    variant.values.forEach(valueId => {
      const value = variantType.values.find(v => v.id === valueId);
      if (value) {
        const newSku = currentSku + (currentSku.includes('-') ? '' : '-') + value.code;
        const newCodes = currentCodes + value.code;
        generateCombinations(newSku, newCodes, variantIndex + 1);
      }
    });
  }

  generateCombinations(baseSku, '', 0);
  return combinations;
}