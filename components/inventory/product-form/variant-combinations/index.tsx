import { VariantCombinationsForm } from './variant-combinations-form';
import { VariantSkusTable } from './variant-skus-table';
import { useVariantCombinations } from './use-variant-combinations';

export function VariantCombinations() {
  const {
    form,
    baseSku,
    basePrice,
    selectedVariants,
    productDetails,
    handlePriceChange,
  } = useVariantCombinations();

  return (
    <div className="space-y-6">
      <VariantCombinationsForm
        selectedVariants={selectedVariants}
        onVariantsChange={(variants) => form.setValue('variants', variants)}
        form={form}
      />

      {selectedVariants.length > 0 && baseSku && (
        <VariantSkusTable
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