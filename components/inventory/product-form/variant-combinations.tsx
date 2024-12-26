import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VariantConfiguration } from '@/components/inventory/variant-form/sections/variant-configuration';
import { GeneratedSkusTable } from '@/components/inventory/variant-form/sections/generated-skus-table';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import type { ProductFormValues } from './form-schema';

interface Brand {
  id: string;
  name: string;
  code: string;
}

export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const { brands } = useBrands();
  const { getProductTypeName } = useProductTypes();

  const getBrandName = (brandId: string) => {
    const brand = brands?.find((b) => b.id === brandId);
    return brand?.name ?? '';
  };

  const brand = form.watch('brand');
  const productTypeId = form.watch('productTypeId');
  const productName = form.watch('productName');
  const baseSku = form.watch('sku');
  const basePrice = form.watch('usdPrice' as const) ?? 0;
  const selectedVariants = form.watch('variants') ?? [];

  const productDetails = {
    brand: getBrandName(brand),
    productType: getProductTypeName(productTypeId),
    productName,
  };

  const handlePriceChange = (sku: string, price: number) => {
    const variantPrices = form.getValues('variantPrices') || {};
    form.setValue('variantPrices', {
      ...variantPrices,
      [sku]: price,
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="variants"
        render={() => (
          <FormItem>
            <FormLabel>Variant Combinations</FormLabel>
            <VariantConfiguration
              selectedVariants={selectedVariants}
              onVariantsChange={(variants) => form.setValue('variants', variants)}
              form={form}
            />
          </FormItem>
        )}
      />

      {selectedVariants.length > 0 && baseSku && (
        <GeneratedSkusTable
          baseSku={baseSku}
          basePrice={basePrice}
          selectedVariants={selectedVariants}
          onPriceChange={handlePriceChange}
          productDetails={productDetails}
        />
      )}
    </div>
  );
}