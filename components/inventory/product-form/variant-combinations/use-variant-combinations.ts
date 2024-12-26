import { useFormContext } from 'react-hook-form';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import type { ProductFormValues } from '../form-schema';

export function useVariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const { brands } = useBrands();
  const { getProductTypeName } = useProductTypes();

  const brand = form.watch('brand');
  const productTypeId = form.watch('productTypeId');
  const productName = form.watch('productName');
  const baseSku = form.watch('sku');
  const basePrice = form.watch('usdPrice') ?? 0;
  const selectedVariants = form.watch('variants') ?? [];

  const productDetails = {
    brand: brand ? brands.find(b => b.id === brand)?.name : '',
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

  return {
    form,
    brand,
    productTypeId,
    productName,
    baseSku,
    basePrice,
    selectedVariants,
    productDetails,
    handlePriceChange,
  };
}