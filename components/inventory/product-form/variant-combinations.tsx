"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateForm,
  selectProductNames,
  selectSkuInfo,
  selectVariantSelectors,
  addVariantSelector,
  updateVariantSelector,
  removeVariantSelector,
  updateVariantSelectorValues,
} from "@/lib/store/slices/formInventoryProductSlice";
import { useVariantTypes } from "@/lib/hooks/use-variant-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VariantTypeSelector as VariantType,
  VariantValueSelector as VariantValue,
} from "./enhanced-selectors";
import type { ProductFormValues } from "./form-schema";
import type { Variant, VariantValue } from "@/types/variant";
import type { SelectOption } from "@/components/ui/enhanced-select";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypes } from "@/lib/hooks/use-product-types";
import { Input } from "@/components/ui/input";
import { RootState } from "@/lib/store";

interface SelectedVariant {
  id: string;
  typeId: number;
  values: string[];
  availableValues?: string[];
}

export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const { variantTypes } = useVariantTypes();
  const variantSelectors = useSelector(selectVariantSelectors);
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<Record<string, string>>({});
  const [focusedSkuKey, setFocusedSkuKey] = useState<string | null>(null);
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);

  const usedTypeIds = useMemo(() => 
    selectedVariants
      .map(variant => variant.typeId)
      .filter(Boolean),
    [selectedVariants]
  );

  const generateVariantId = useCallback(() => 
    `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleAddVariant = useCallback(() => {
    setSelectedVariants(prev => [
      ...prev,
      { id: generateVariantId(), typeId: 0, values: [] }
    ]);
  }, [generateVariantId]);

  const handleRemoveVariant = useCallback((variantId: string) => {
    setSelectedVariants(prev => 
      prev.filter(v => v.id !== variantId)
    );
  }, []);

  const handleTypeChange = useCallback((
    variantId: string, 
    selected: SelectOption | null
  ) => {
    if (!selected?.data) return;

    setSelectedVariants(prev => {
      const newVariants = prev.map(v =>
        v.id === variantId
          ? {
              ...v,
              typeId: parseInt(selected.value),
              values: [], // Reset values when type changes
            }
          : v
      );
      return newVariants;
    });

    // Update Redux store
    dispatch(addVariantSelector({
      id: parseInt(selected.value),
      name: selected.data.name,
      values: selected.data.values || [],
      selected_values: [],
    }));
  }, [dispatch]);

  const handleValuesChange = useCallback((
    variantId: string, 
    selected: SelectOption[]
  ) => {
    const variant = selectedVariants.find(v => v.id === variantId);
    if (!variant) return;

    setSelectedVariants(prev => {
      const newVariants = prev.map(v =>
        v.id === variantId
          ? {
              ...v,
              values: selected.map(option => option.value),
            }
          : v
      );

      const formattedVariants = newVariants
        .filter(v => v.typeId)
        .map(variant => {
          const variantType = variantTypes?.find(
            vt => vt.id === variant.typeId
          );
          return {
            variant_id: variant.typeId,
            variant_name: variantType?.name || "",
            variant_values: variant.values.map(value => ({
              variant_value_id: 0,
              variant_value_name: value,
            })),
          };
        });

      // Update Redux store
      dispatch(updateForm({ variants: formattedVariants }));
      dispatch(updateVariantSelectorValues({
        id: variant.typeId,
        selected_values: selected.map(option => option.value),
      }));

      return newVariants;
    });
  }, [dispatch, selectedVariants, variantTypes]);

  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      v => v.typeId && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  const variantData = useMemo(() => {
    if (!canShowGeneratedSkus) return [];

    const generateCombinations = (variants: SelectedVariant[]) => {
      if (variants.length === 0) return [[]];
      const [first, ...rest] = variants;
      const restCombinations = generateCombinations(rest);
      return first.values.flatMap(value => 
        restCombinations.map(combo => [value, ...combo])
      );
    };

    const combinations = generateCombinations(
      selectedVariants.filter(v => v.values.length > 0)
    );

    return combinations.map((combo, index) => {
      const uniqueCode = String(index + 1).padStart(4, "0");
      return {
        originalSkuKey: `${baseSku}-${index + 1}`,
        skuKey: `${baseSku}-${uniqueCode}`,
        productName: `${full_product_name} ${combo.join(" ")}`,
        uniqueCode,
        combo,
      };
    });
  }, [canShowGeneratedSkus, selectedVariants, baseSku, full_product_name]);

  useEffect(() => {
    if (variantData.length) {
      dispatch(updateForm({
        product_by_variant: variantData.map(variant => ({
          originalSkuKey: variant.originalSkuKey,
          sku: variant.skuKey,
          unique_code: variant.uniqueCode,
          product_name: variant.productName,
        }))
      }));
    }
  }, [variantData, dispatch]);

  const handleUniqueCodeChange = useCallback((originalSkuKey: string, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 4);
    setVariantUniqueCodes(prev => ({
      ...prev,
      [originalSkuKey]: cleanValue
    }));

    const updatedVariants = variantData.map(variant => ({
      originalSkuKey: variant.originalSkuKey,
      sku: variant.originalSkuKey === originalSkuKey 
        ? `${baseSku}-${cleanValue || "0000"}`
        : variant.skuKey,
      unique_code: variant.originalSkuKey === originalSkuKey
        ? cleanValue
        : variant.uniqueCode,
      product_name: variant.productName,
    }));

    dispatch(updateForm({ product_by_variant: updatedVariants }));
  }, [baseSku, variantData, dispatch]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedVariants.map((variant) => {
          const currentSelector = variantSelectors.find(
            (selector) => selector.id === variant.typeId
          );

          const valueOptions = variant.values.map((value) => ({
            value: value,
            label: value,
            data: value,
          }));

          return (
            <div
              key={variant.id}
              className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto] gap-3 items-start"
            >
              <div className="w-full min-w-[180px]">
                <VariantType
                  key={`type-${variant.id}`}
                  value={
                    variant.typeId
                      ? {
                          value: variant.typeId.toString(),
                          label: currentSelector?.name || "",
                          data: {
                            id: variant.typeId,
                            name: currentSelector?.name || "",
                            values: currentSelector?.values || [],
                          },
                        }
                      : null
                  }
                  onChange={(selected) =>
                    handleTypeChange(variant.id, selected)
                  }
                  excludeIds={usedTypeIds.filter((id) => id !== variant.typeId)}
                />
              </div>
              <div className="w-full min-w-[200px]">
                <VariantValue
                  key={`value-${variant.id}-${variant.typeId}`}
                  values={currentSelector?.values || []}
                  value={valueOptions.length > 0 ? valueOptions : null}
                  onChange={(selected) =>
                    handleValuesChange(variant.id, selected)
                  }
                  isDisabled={!variant.typeId}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-start mt-0"
                onClick={() => handleRemoveVariant(variant.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <Button type="button" variant="outline" onClick={handleAddVariant}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {!canShowGeneratedSkus && variantSelectors.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Please complete the following to generate SKUs:
          <ul className="list-disc list-inside mt-2">
            {!full_product_name && <li>Product name is required</li>}
            {!baseSku && <li>Base SKU is required</li>}
            {!selectedVariants.some((v) => v.typeId && v.values.length > 0) && (
              <li>At least one variant with selected values is required</li>
            )}
          </ul>
        </div>
      )}

      {canShowGeneratedSkus && variantData.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Generated SKUs</h4>
            <div className="overflow-auto">
              <div className="rounded-md border min-w-[640px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">
                        Full Product Name
                      </TableHead>
                      <TableHead className="w-[30%]">SKU Variant</TableHead>
                      <TableHead className="w-[20%]">Unique Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantData.map(
                      ({
                        originalSkuKey,
                        skuKey,
                        productName,
                        uniqueCode,
                      }) => (
                        <TableRow key={skuKey}>
                          <TableCell>{productName}</TableCell>
                          <TableCell className="font-medium">
                            {skuKey}
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`${skuKey}-input`}
                              value={
                                variantUniqueCodes[originalSkuKey] || uniqueCode
                              }
                              onChange={(e) =>
                                handleUniqueCodeChange(
                                  originalSkuKey,
                                  e.target.value
                                )
                              }
                              onFocus={() => setFocusedSkuKey(originalSkuKey)}
                              onBlur={() => {
                                const currentValue =
                                  variantUniqueCodes[originalSkuKey] ||
                                  uniqueCode;
                                const paddedValue = currentValue.padStart(
                                  4,
                                  "0"
                                );
                                handleUniqueCodeChange(
                                  originalSkuKey,
                                  paddedValue
                                );
                                setFocusedSkuKey(null);
                              }}
                              className="w-[120px] font-mono"
                              placeholder="0000"
                              maxLength={4}
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}