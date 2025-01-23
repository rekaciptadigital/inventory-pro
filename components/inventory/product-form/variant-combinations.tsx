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
  const [pendingReduxUpdate, setPendingReduxUpdate] = useState<{
    type: "variants" | "selector";
    data: any;
  } | null>(null);
  const [pendingTypeUpdate, setPendingTypeUpdate] = useState<{
    variantId: string;
    data: { id: number; name: string; values: string[] };
  } | null>(null);
  const [pendingValuesUpdate, setPendingValuesUpdate] = useState<{
    variant: SelectedVariant;
    selectedValues: string[];
    variants: any[];
  } | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();
  const brand = form.watch("brand");
  const productTypeId = form.watch("productTypeId");
  const sku = form.watch("sku");
  const productName = form.watch("productName");
  const brandName = brands?.find((b) => b.id === brand)?.name || "";
  const productTypeName =
    productTypes?.find((pt) => pt.id === productTypeId)?.name || "";
  const productDetails = {
    brand: brandName,
    productType: productTypeName,
    productName,
  };
  const generateVariantId = useCallback((index: number) => {
    return `variant-${index}`;
  }, []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddVariant = useCallback(() => {
    const newIndex = selectedVariants.length;
    const uniqueId = generateVariantId(newIndex);

    setSelectedVariants((prev) => [
      ...prev,
      { id: uniqueId, typeId: 0, values: [] },
    ]);

    const currentVariants = selectedVariants.map((variant) => ({
      variant_id: variant.typeId,
      variant_name:
        variantTypes?.find((vt) => vt.id === variant.typeId)?.name || "",
      variant_values: variant.values.map((value) => ({
        variant_value_id: 0,
        variant_value_name: value,
      })),
    }));

    dispatch(updateForm({ variants: currentVariants }));
  }, [dispatch, selectedVariants, variantTypes]);

  const handleRemoveVariant = useCallback((variantId: string) => {
    setPendingRemoval(variantId);
  }, []);

  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                typeId: parseInt(selected.value),
                values: [],
              }
            : v
        );
        return newVariants;
      });

      setPendingTypeUpdate({
        variantId,
        data: {
          id: parseInt(selected.value),
          name: selected.data.name,
          values: selected.data.values || [],
        },
      });
    },
    []
  );

  const handleValuesChange = useCallback(
    (variantId: string, selected: SelectOption[]) => {
      const variant = selectedVariants.find((v) => v.id === variantId);
      if (!variant) return;

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                values: selected.map((option) => option.value),
              }
            : v
        );

        const formattedVariants = newVariants
          .filter((v) => v.typeId)
          .map((variant) => {
            const variantType = variantTypes?.find(
              (vt) => vt.id === variant.typeId
            );
            return {
              variant_id: variant.typeId,
              variant_name: variantType?.name || "",
              variant_values: variant.values.map((value) => ({
                variant_value_id: 0,
                variant_value_name: value,
              })),
            };
          });

        setPendingValuesUpdate({
          variant,
          selectedValues: selected.map((option) => option.value),
          variants: formattedVariants,
        });

        return newVariants;
      });
    },
    [variantTypes, selectedVariants]
  );

  useEffect(() => {
    if (!pendingReduxUpdate) return;

    if (pendingReduxUpdate.type === "variants") {
      dispatch(updateForm({ variants: pendingReduxUpdate.data.variants }));
      dispatch(
        updateVariantSelectorValues(pendingReduxUpdate.data.selectorUpdate)
      );
    }

    setPendingReduxUpdate(null);
  }, [pendingReduxUpdate, dispatch]);

  useEffect(() => {
    const savedVariants = form.getValues("variants");
    if (savedVariants?.length) {
      const formattedVariants = savedVariants.map((variant, index) => ({
        id: generateVariantId(index),
        typeId: variant.variant_id,
        values: variant.variant_values.map((v) =>
          v.variant_value_id.toString()
        ),
      }));
      setSelectedVariants(formattedVariants);
    }
  }, []);

  useEffect(() => {
    if (pendingTypeUpdate) {
      dispatch(
        addVariantSelector({
          id: pendingTypeUpdate.data.id,
          name: pendingTypeUpdate.data.name,
          values: pendingTypeUpdate.data.values,
          selected_values: [],
        })
      );
      setPendingTypeUpdate(null);
    }
  }, [pendingTypeUpdate, dispatch]);

  useEffect(() => {
    if (pendingValuesUpdate) {
      dispatch(updateForm({ variants: pendingValuesUpdate.variants }));
      dispatch(
        updateVariantSelectorValues({
          id: pendingValuesUpdate.variant.typeId,
          selected_values: pendingValuesUpdate.selectedValues,
        })
      );
      setPendingValuesUpdate(null);
    }
  }, [pendingValuesUpdate, dispatch]);

  useEffect(() => {
    if (pendingRemoval === null) return;

    const variant = selectedVariants.find((v) => v.id === pendingRemoval);
    if (variant?.typeId) {
      dispatch(removeVariantSelector(variant.typeId));
    }

    const newVariants = selectedVariants.filter((v) => v.id !== pendingRemoval);

    const formattedVariants = newVariants
      .filter((v) => v.typeId)
      .map((variant) => {
        const variantType = variantTypes?.find(
          (vt) => vt.id === variant.typeId
        );
        return {
          variant_id: variant.typeId,
          variant_name: variantType?.name || "",
          variant_values: variant.values.map((value) => ({
            variant_value_id: 0,
            variant_value_name: value,
          })),
        };
      });

    setSelectedVariants(newVariants);
    dispatch(updateForm({ variants: formattedVariants }));

    form.setValue("variants", formattedVariants, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setPendingRemoval(null);
  }, [pendingRemoval, selectedVariants, dispatch, form, variantTypes]);

  const usedTypeIds = selectedVariants.map((v) => v.typeId).filter(Boolean);

  const handleVariantChange = useCallback(
    (selectedVariants: Variant[]) => {
      const formattedVariants = selectedVariants.map((variant) => ({
        variant_id: variant.id,
        variant_name: variant.name,
        variant_values: variant.selectedValues.map((value) => ({
          variant_value_id: value.id,
          variant_value_name: value.name,
        })),
      }));

      dispatch(
        updateForm({
          variants: formattedVariants,
        })
      );
    },
    [dispatch]
  );

  const handleVariantValuesChange = useCallback(
    (variantId: number, selectedValues: VariantValue[]) => {
      dispatch(
        updateForm({
          variants: (prevVariants: any[]) => {
            const updatedVariants = prevVariants.map((variant) => {
              if (variant.variant_id === variantId) {
                return {
                  ...variant,
                  variant_values: selectedValues.map((value) => ({
                    variant_value_id: value.id,
                    variant_value_name: value.name,
                  })),
                };
              }
              return variant;
            });
            return updatedVariants;
          },
        })
      );
    },
    [dispatch]
  );

  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);

  const generateCombinations = (variants: SelectedVariant[]) => {
    if (variants.length === 0) return [[]];

    const [first, ...rest] = variants;
    const restCombinations = generateCombinations(rest);

    return first.values.flatMap((value) =>
      restCombinations.map((combo) => [value, ...combo])
    );
  };

  const formatVariantCombo = (combo: string[]) => {
    return combo.join(" ");
  };

  const [variantUniqueCodes, setVariantUniqueCodes] = useState<
    Record<string, string>
  >({});

  const generateUniqueCode = useCallback((index: number) => {
    return String(index + 1).padStart(4, "0");
  }, []);

  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      (v) => v.typeId && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  const productByVariant = useSelector(
    (state: RootState) => state.formInventoryProduct.product_by_variant
  );

  const variantData = useMemo(() => {
    if (!canShowGeneratedSkus) return [];

    const filteredVariants = selectedVariants.filter(
      (v) => v.values.length > 0
    );
    const combinations = generateCombinations(filteredVariants);

    return combinations.map((combo, index) => {
      const variantCombo = formatVariantCombo(combo);
      const originalSkuKey = `${baseSku}-${index + 1}`;

      const existingVariant = productByVariant?.find(
        (v) => v.originalSkuKey === originalSkuKey
      );
      const uniqueCode =
        existingVariant?.unique_code || generateUniqueCode(index);

      return {
        originalSkuKey,
        skuKey: `${baseSku}-${uniqueCode}`,
        productName: `${full_product_name} ${variantCombo}`,
        uniqueCode,
        combo,
      };
    });
  }, [
    canShowGeneratedSkus,
    selectedVariants,
    full_product_name,
    baseSku,
    productByVariant,
    generateUniqueCode,
  ]);

  const handleUniqueCodeChange = useCallback(
    (originalSkuKey: string, value: string) => {
      const cleanValue = value.replace(/\D/g, "").slice(0, 4);

      setVariantUniqueCodes((prev) => ({
        ...prev,
        [originalSkuKey]: cleanValue,
      }));

      const updatedVariants = variantData.map((variant) => ({
        originalSkuKey: variant.originalSkuKey,
        sku:
          variant.originalSkuKey === originalSkuKey
            ? `${baseSku}-${cleanValue || "0000"}`
            : variant.skuKey,
        unique_code:
          variant.originalSkuKey === originalSkuKey
            ? cleanValue
            : variant.uniqueCode,
        product_name: variant.productName,
      }));

      const timeoutId = setTimeout(() => {
        dispatch(
          updateForm({
            product_by_variant: updatedVariants,
          })
        );
      }, 100);

      return () => clearTimeout(timeoutId);
    },
    [baseSku, dispatch, variantData]
  );

  const [focusedSkuKey, setFocusedSkuKey] = useState<string | null>(null);

  if (!isClient) {
    return null;
  }

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
                        combo,
                      }) => (
                        <TableRow key={skuKey}>
                          <TableCell>{productName}</TableCell>
                          <TableCell className="font-medium">
                            {skuKey}
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`${skuKey}-input`}
                              value={uniqueCode}
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