import { GeneratedSkusTable } from '@/components/inventory/variant-form/sections/generated-skus-table';

interface VariantSkusTableProps {
  readonly baseSku: string;
  readonly basePrice: number;
  readonly selectedVariants: Array<{ readonly typeId: string; readonly values: string[] }>;
  readonly onPriceChange: (sku: string, price: number) => void;
  readonly productDetails: {
    readonly brand?: string; // Make brand optional
    readonly productType: string;
    readonly productName: string;
  };
}

export function VariantSkusTable({
  baseSku,
  basePrice,
  selectedVariants,
  onPriceChange,
  productDetails: {
    brand = '', // Provide default value
    productType,
    productName,
  },
}: VariantSkusTableProps) {
  return (
    <GeneratedSkusTable
      baseSku={baseSku}
      basePrice={basePrice}
      selectedVariants={selectedVariants}
      onPriceChange={onPriceChange}
      productDetails={{ brand, productType, productName }}
    />
  );
}