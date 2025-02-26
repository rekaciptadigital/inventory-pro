import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { 
  updateForm,
  removeVariantSelector,
  addVariantSelector,
  updateVariantSelectorValues
} from "@/lib/store/slices/formInventoryProductSlice";
import type { SelectOption } from "@/components/ui/enhanced-select";
import type {
  VariantManagerProps,
  VariantManagerReturn,
  SelectedVariant,
  VariantSelectorData,
  VariantValue,
  VariantTypeData
} from "../types/variant-types";
import type { VariantSelectorData as StoreVariantSelectorData } from "@/lib/store/types/inventory";

export type { SelectedVariant } from "../types/variant-types";


/**
 * Helper to convert VariantValue to string if needed
 */
function getValueName(value: string | VariantValue): string {
  return typeof value === 'string' ? value : value.name;
}

export function useVariantManager({
  variantTypes,
  existingVariants,
  variantSelectors,
  dispatch
}: VariantManagerProps): VariantManagerReturn {
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<Record<string, string>>({});
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [skuStatuses, setSkuStatuses] = useState<Record<string, boolean>>({});
  const [skipReduxUpdate, setSkipReduxUpdate] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const [isInitialized, setIsInitialized] = useState(false);

  const generateVariantId = useCallback(
    () => `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const usedTypeIds = useMemo(
    () => selectedVariants.map((variant) => variant.typeId).filter(Boolean),
    [selectedVariants]
  );

  const handleAddVariant = useCallback(() => {
    setSelectedVariants((prev) => [
      ...prev,
      { id: generateVariantId(), typeId: 0, values: [] },
    ]);
  }, [generateVariantId]);

  const handleRemoveVariant = useCallback(
    (variantId: string) => {
      setSelectedVariants((prev) => {
        const newVariants = prev.filter((v: SelectedVariant) => v.id !== variantId);

        if (newVariants.length === 0) {
          setVariantUniqueCodes({});
          setLocalValues({});

          dispatch(
            updateForm({
              variants: [],
              variant_selectors: [],
              product_by_variant: [],
            })
          );
        } else {
          const variantToRemove = prev.find((v: SelectedVariant) => v.id === variantId);
          if (variantToRemove?.typeId) {
            dispatch(removeVariantSelector(variantToRemove.typeId));
          }
        }

        return newVariants;
      });
    },
    [dispatch]
  );

  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      const selectedVariantType = variantTypes?.find(
        (vt: VariantTypeData) => vt.id === parseInt(selected.value)
      );

      const existingVariant = existingVariants.find(
        (v) => v.variant_id === parseInt(selected.value)
      );

      setSelectedVariants((prev) => {
        setVariantUniqueCodes({});
        setLocalValues({});

        const newVariants = prev.map((v: SelectedVariant) =>
          v.id === variantId
            ? {
                ...v,
                typeId: parseInt(selected.value),
                values: existingVariant?.variant_values.map((value) => value.variant_value_name) || [],
                display_order: selectedVariantType?.display_order || 0,
              }
            : v
        );
        return newVariants;
      });

      const existingSelector = variantSelectors.find(
        (selector) => selector.id === parseInt(selected.value)
      );

      if (!existingSelector && selectedVariantType) {
        const values = Array.isArray(selectedVariantType.values) 
          ? selectedVariantType.values.map((v: string | VariantValue) => typeof v === 'string' ? v : v.name)
          : [];

        const selectorData: StoreVariantSelectorData = {
          id: parseInt(selected.value),
          name: selectedVariantType.name,
          values,
          selected_values: existingVariant?.variant_values.map((v) => v.variant_value_name) || [],
        };

        if (selectedVariantType.display_order !== undefined) {
          selectorData.display_order = selectedVariantType.display_order;
        }

        dispatch(addVariantSelector(selectorData));
      }
    },
    [dispatch, existingVariants, variantSelectors, variantTypes]
  );

  const handleValuesChange = useCallback(
    (variantId: string, selected: SelectOption[]) => {
      const selectedValues = selected.map((option: SelectOption) => option.value);

      setSelectedVariants((prev) => {
        setVariantUniqueCodes({});
        setLocalValues({});

        const newVariants = prev.map((v: SelectedVariant) =>
          v.id === variantId
            ? {
                ...v,
                values: selectedValues,
              }
            : v
        );
        return newVariants;
      });

      const variant = selectedVariants.find((v) => v.id === variantId);
      variant?.typeId && dispatch(
        updateVariantSelectorValues({
          id: variant.typeId,
          selected_values: selectedValues,
        })
      );
    },
    [dispatch, selectedVariants]
  );

  // Update local value helper
  const updateLocalValue = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Handlers for variant code updates
  const handleUniqueCodeChange = useCallback(
    (originalSkuKey: string, value: string) => {
      if (!RegExp(/^\d*$/).exec(value)) return;
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      updateLocalValue(originalSkuKey, cleanValue);
      setSkipReduxUpdate(true);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    },
    [updateLocalValue]
  );

  const handleInputBlur = useCallback(
    (originalSkuKey: string, value: string) => {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      const paddedValue = cleanValue.length < 4 ? cleanValue.padStart(4, "0") : cleanValue;
      updateLocalValue(originalSkuKey, paddedValue);
      setSkipReduxUpdate(false);
      setVariantUniqueCodes((prev) => ({
        ...prev,
        [originalSkuKey]: paddedValue,
      }));
    },
    [updateLocalValue]
  );

  const handleResetUniqueCode = useCallback((originalSkuKey: string) => {
    setLocalValues((prev) => {
      const newValues = { ...prev };
      delete newValues[originalSkuKey];
      return newValues;
    });

    setVariantUniqueCodes((prev) => {
      const newValues = { ...prev };
      delete newValues[originalSkuKey];
      return newValues;
    });
  }, []);

  const handleStatusToggle = useCallback((sku: string, checked: boolean) => {
    setSkuStatuses(prev => ({
      ...prev,
      [sku]: checked
    }));
  }, []);

  const handleVendorSkuChange = useCallback((originalSkuKey: string, value: string) => {
    updateLocalValue(`vendor-${originalSkuKey}`, value);
  }, [updateLocalValue]);

  const handleVendorSkuBlur = useCallback((originalSkuKey: string, value: string) => {
    // This is handled in the effect in the parent
  }, []);

  const initializeVariants = useCallback((initialVariants: SelectedVariant[], variantSelectorData: VariantSelectorData[]) => {
    setSelectedVariants(initialVariants);
    dispatch(updateForm({
      variants: existingVariants,
      variant_selectors: variantSelectorData,
    }));
  }, [dispatch, existingVariants]);

  // Effect to update variants in form
  useEffect(() => {
    if (!selectedVariants.length) return;

    const formattedVariants = selectedVariants
      .filter((v) => v.typeId)
      .map((variant) => {
        const variantType = variantTypes?.find(
          (vt: VariantTypeData) => vt.id === variant.typeId
        );
        return {
          variant_id: variant.typeId,
          variant_name: variantType?.name ?? "",
          variant_values: variant.values.map((value) => ({
            variant_value_id: "0",
            variant_value_name: value,
          })),
        };
      });

    dispatch(updateForm({ variants: formattedVariants }));

    const timer = setTimeout(() => {
      selectedVariants.forEach((variant) => {
        if (variant.typeId) {
          dispatch(
            updateVariantSelectorValues({
              id: variant.typeId,
              selected_values: variant.values,
            })
          );
        }
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedVariants, variantTypes, dispatch]);

  return {
    selectedVariants,
    variantUniqueCodes,
    localValues,
    skuStatuses,
    skipReduxUpdate,
    usedTypeIds,
    handleAddVariant,
    handleRemoveVariant,
    handleTypeChange,
    handleValuesChange,
    setIsInitialized,
    handleVariantCodeUpdate: {
      handleUniqueCodeChange,
      handleInputBlur,
      handleResetUniqueCode,
      handleStatusToggle,
      handleVendorSkuChange,
      handleVendorSkuBlur,
      initializeVariants
    }
  };
}
