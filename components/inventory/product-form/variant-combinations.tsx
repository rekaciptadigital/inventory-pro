"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, RotateCcw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateForm,
  selectProductNames,
  selectSkuInfo,
  selectVariantSelectors,
  addVariantSelector,
  removeVariantSelector,
  updateVariantSelectorValues,
} from "@/lib/store/slices/formInventoryProductSlice";
import { Switch } from "@/components/ui/switch";
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
  VariantValueSelector as VariantValueSelect,
} from "./enhanced-selectors";
import type { ProductFormValues } from "./form-schema";
import type { VariantValue as VariantValueType } from "@/types/variant";
import type { SelectOption } from "@/components/ui/enhanced-select";
import { Input } from "@/components/ui/input";
import { RootState } from "@/lib/store";
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';

interface VariantValueData {
  variant_value_id: string;
  variant_value_name: string;
}

interface VariantType {
  id: number;
  name: string;
  values: string[];
  display_order: number;
}

interface SelectedVariant {
  id: string;
  typeId: number;
  values: string[];
  availableValues?: string[];
  display_order?: number;
}

interface VariantTableData {
  originalSkuKey: string;
  skuKey: string;
  productName: string;
  uniqueCode: string;
  combo: string[];
}

interface CurrentSelector {
  id: number;
  name: string;
  values: string[];
  selected_values: string[];
}

interface ExistingVariant {
  variant_id: number;
  variant_name: string;
  variant_values: Array<{
    variant_value_id: string;
    variant_value_name: string;
  }>;
}

interface VariantSelectorData {
  id: number;
  name: string;
  values: string[];
  selected_values?: string[];
}

interface InputStates {
  value: string;
  isDirty: boolean;
}

export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const { variantTypes } = useVariantTypes();
  const variantSelectors = useSelector(selectVariantSelectors);
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<Record<string, string>>({});
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);
  const existingVariants = useSelector((state: RootState) => state.formInventoryProduct.variants);
  const [skuStatuses, setSkuStatuses] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [skipReduxUpdate, setSkipReduxUpdate] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const usedTypeIds = useMemo(
    () => selectedVariants.map((variant) => variant.typeId).filter(Boolean),
    [selectedVariants]
  );

  const generateVariantId = useCallback(
    () => `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
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

  useEffect(() => {
    if (selectedVariants.length === 0) {
      dispatch(
        updateForm({
          variants: [],
          variant_selectors: [],
          product_by_variant: [],
        })
      );
    }
  }, [selectedVariants, dispatch]);

  useEffect(() => {
    if (!isInitialized && existingVariants?.length > 0 && variantTypes?.length > 0) {
      try {
        setIsInitialized(true);

        const initialVariants = existingVariants.map((variant: ExistingVariant) => {
          const variantType = variantTypes.find(vt => vt.id === variant.variant_id);
          return {
            id: `variant-${variant.variant_id}`,
            typeId: variant.variant_id,
            values: variant.variant_values.map((v) => v.variant_value_name),
            availableValues: variantType?.values || [],
            display_order: variantType?.display_order || 0,
          };
        });

        initialVariants.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        const variantSelectors = existingVariants.map((variant: ExistingVariant) => {
          const variantType = variantTypes.find(vt => vt.id === variant.variant_id);
          return {
            id: variant.variant_id,
            name: variantType?.name ?? variant.variant_name,
            values: variantType?.values || [],
            selected_values: variant.variant_values.map((v) => v.variant_value_name),
          };
        });

        Promise.resolve().then(() => {
          setSelectedVariants(initialVariants);
          dispatch(updateForm({
            variants: existingVariants,
            variant_selectors: variantSelectors,
          }));
        });

      } catch (error) {
        console.error('Error initializing variants:', error);
        setIsInitialized(false);
      }
    }
  }, [existingVariants, variantTypes, isInitialized, dispatch]);

  useEffect(() => {
    return () => {
      setIsInitialized(false);
    };
  }, []);

  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      const selectedVariantType = variantTypes?.find(
        vt => vt.id === parseInt(selected.value)
      );

      const existingVariant = existingVariants.find(
        (v: ExistingVariant) => v.variant_id === parseInt(selected.value)
      );

      setSelectedVariants((prev) => {
        setVariantUniqueCodes({});
        setLocalValues({});

        const newVariants = prev.map((v: SelectedVariant) =>
          v.id === variantId
            ? {
                ...v,
                typeId: parseInt(selected.value),
                values: existingVariant?.variant_values.map((value: VariantValueData) => value.variant_value_name) || [],
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
        dispatch(
          addVariantSelector({
            id: parseInt(selected.value),
            name: selectedVariantType.name,
            values: selectedVariantType.values || [],
            selected_values: existingVariant?.variant_values.map((v) => v.variant_value_name) || [],
            display_order: selectedVariantType.display_order,
          })
        );
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
      if (variant && variant.typeId) {
        dispatch(
          updateVariantSelectorValues({
            id: variant.typeId,
            selected_values: selectedValues,
          })
        );
      }
    },
    [dispatch, selectedVariants]
  );

  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      (v) => v.typeId && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  const variantData = useMemo(() => {
    if (!canShowGeneratedSkus) return [];

    const generateCombinations = (variants: SelectedVariant[]) => {
      if (variants.length === 0) return [[]];

      const sortedVariants = [...variants].sort((a, b) => {
        const typeA = variantTypes?.find(vt => vt.id === a.typeId);
        const typeB = variantTypes?.find(vt => vt.id === b.typeId);
        
        const orderA = typeA?.display_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = typeB?.display_order ?? Number.MAX_SAFE_INTEGER;
        
        return orderA - orderB;
      });

      let combinations: string[][] = [[]];
      
      sortedVariants.forEach(variant => {
        const newCombinations: string[][] = [];
        combinations.forEach(combo => {
          variant.values.forEach(value => {
            newCombinations.push([...combo, value]);
          });
        });
        combinations = newCombinations;
      });

      return combinations;
    };

    const validVariants = selectedVariants
      .filter((v) => v.typeId && v.values.length > 0)
      .sort((a, b) => {
        const typeA = variantTypes?.find(vt => vt.id === a.typeId);
        const typeB = variantTypes?.find(vt => vt.id === b.typeId);
        const orderA = typeA?.display_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = typeB?.display_order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });

    const combinations = generateCombinations(validVariants);

    return combinations.map((combo, index) => {
      const defaultUniqueCode = String(index + 1).padStart(4, "0");
      const originalSkuKey = `${baseSku}-${index + 1}`;
      const storedUniqueCode = variantUniqueCodes[originalSkuKey];
      const uniqueCode = storedUniqueCode || defaultUniqueCode;

      return {
        originalSkuKey,
        skuKey: `${baseSku}-${uniqueCode}`,
        productName: `${full_product_name} ${combo.join(" ")}`,
        uniqueCode,
        combo,
      };
    });
  }, [
    canShowGeneratedSkus,
    selectedVariants,
    variantTypes,
    baseSku,
    full_product_name,
    variantUniqueCodes,
  ]);

  useEffect(() => {
    if (!selectedVariants.length) return;

    const formattedVariants = selectedVariants
      .filter((v) => v.typeId)
      .map((variant) => {
        const variantType = variantTypes?.find(
          (vt) => vt.id === variant.typeId
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

  const updateLocalValue = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleUniqueCodeChange = useCallback(
    (originalSkuKey: string, value: string) => {
      if (!value.match(/^\d*$/)) return;
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      updateLocalValue(originalSkuKey, cleanValue);
      setSkipReduxUpdate(true);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
      }, 300);
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
      dispatch(
        updateForm({
          product_by_variant: variantData.map((variant) => ({
            originalSkuKey: variant.originalSkuKey,
            sku: variant.originalSkuKey === originalSkuKey
              ? `${baseSku}-${paddedValue}`
              : variant.skuKey,
            sku_product_unique_code: variant.originalSkuKey === originalSkuKey
              ? paddedValue
              : variant.uniqueCode,
            full_product_name: variant.productName,
          })),
        })
      );
    },
    [updateLocalValue, variantData, baseSku, dispatch]
  );

  useEffect(() => {
    if (variantData.length && !skipReduxUpdate) {
      dispatch(
        updateForm({
          product_by_variant: variantData.map((variant) => ({
            originalSkuKey: variant.originalSkuKey,
            sku: variant.skuKey,
            sku_product_unique_code: variant.uniqueCode,
            full_product_name: variant.productName,
          })),
        })
      );
    }
  }, [variantData, dispatch, skipReduxUpdate]);

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

    const defaultUniqueCode = variantData.find(
      (v) => v.originalSkuKey === originalSkuKey
    )?.uniqueCode || "0000";

    dispatch(
      updateForm({
        product_by_variant: variantData.map((variant) => ({
          originalSkuKey: variant.originalSkuKey,
          sku:
            variant.originalSkuKey === originalSkuKey
              ? `${baseSku}-${defaultUniqueCode}`
              : variant.skuKey,
          sku_product_unique_code:
            variant.originalSkuKey === originalSkuKey
              ? defaultUniqueCode
              : variant.uniqueCode,
          full_product_name: variant.productName,
        })),
      })
    );
  }, [baseSku, variantData, dispatch]);

  const handleStatusToggle = useCallback((sku: string, checked: boolean) => {
    setSkuStatuses(prev => ({
      ...prev,
      [sku]: checked
    }));
    
    dispatch(
      updateForm({
        product_by_variant: variantData.map((variant) => ({
          originalSkuKey: variant.originalSkuKey,
          sku: variant.skuKey,
          sku_product_unique_code: variant.uniqueCode,
          full_product_name: variant.productName,
          status: variant.originalSkuKey === sku ? checked : (skuStatuses[variant.originalSkuKey] ?? true)
        })),
      })
    );
  }, [dispatch, variantData, skuStatuses]);

  const renderSkuFields = useCallback(
    (originalSkuKey: string, skuKey: string, uniqueCode: string) => {
      const defaultUniqueCode = String(
        variantData.findIndex((v) => v.originalSkuKey === originalSkuKey) + 1
      ).padStart(4, "0");

      const inputValue = localValues[originalSkuKey] ?? uniqueCode;
      const formGroupId = `variant-group-${originalSkuKey}`;

      return (
        <div id={formGroupId} className="grid grid-cols-2 gap-4" role="group" aria-labelledby={`${formGroupId}-heading`}>
          <FormItem className="space-y-2">
            <FormControl>
              <div className="space-y-1">
                <FormLabel htmlFor={`sku-variant-${originalSkuKey}`}>SKU Variant</FormLabel>
                <Input
                  id={`sku-variant-${originalSkuKey}`}
                  name={`sku-variant-${originalSkuKey}`}
                  value={skuKey}
                  className="font-mono bg-muted"
                  readOnly
                />
              </div>
            </FormControl>
            <FormDescription>
              Generated SKU based on main SKU and unique code
            </FormDescription>
          </FormItem>

          <FormItem className="space-y-2">
            <FormControl>
              <div className="space-y-1">
                <FormLabel htmlFor={`unique-code-${originalSkuKey}`}>Unique Code</FormLabel>
                <div className="relative">
                  <Input
                    id={`unique-code-${originalSkuKey}`}
                    name={`unique-code-${originalSkuKey}`}
                    value={inputValue}
                    onChange={(e) => handleUniqueCodeChange(originalSkuKey, e.target.value)}
                    onBlur={(e) => handleInputBlur(originalSkuKey, e.target.value)}
                    className="font-mono pr-8"
                    placeholder="0000"
                    maxLength={10}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => handleResetUniqueCode(originalSkuKey)}
                    title={`Reset to default (${defaultUniqueCode})`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              <span className="block">Enter 1-10 numeric or use the default code</span>
            </FormDescription>
          </FormItem>
        </div>
      );
    },
    [localValues, handleUniqueCodeChange, handleInputBlur, handleResetUniqueCode, variantData]
  );

  const renderVariantValue = useCallback(
    (variant: SelectedVariant, currentSelector?: CurrentSelector) => {
      const valueOptions = variant.values.map((value) => ({
        value: value,
        label: value,
        data: value,
      }));

      return (
        <VariantValueSelect
          key={`value-${variant.id}-${variant.typeId}-${variant.values.join(
            ","
          )}`}
          values={currentSelector?.values || []}
          value={valueOptions}
          onChange={(selected) => handleValuesChange(variant.id, selected)}
          isDisabled={!variant.typeId}
        />
      );
    },
    [handleValuesChange]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedVariants.map((variant) => {
          const selector = variantSelectors.find(
            (selector) => selector.id === variant.typeId
          );
          
          const currentSelector: CurrentSelector | undefined = selector ? {
            id: selector.id,
            name: selector.name,
            values: selector.values,
            selected_values: selector.selected_values || [],
          } : undefined;
          
          const variantType = variantTypes?.find(
            (vt) => vt.id === variant.typeId
          );

          return (
            <div key={variant.id} className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto] gap-3 items-start">
              <div className="w-full min-w-[180px]">
                <VariantType
                  key={`type-${variant.id}`}
                  value={variant.typeId ? {
                    value: variant.typeId.toString(),
                    label: variantType?.name ?? currentSelector?.name ?? "",
                    data: {
                      id: variant.typeId,
                      name: variantType?.name ?? currentSelector?.name ?? "",
                      values: variantType?.values ?? currentSelector?.values ?? [],
                    },
                  } : null}
                  onChange={(selected) => handleTypeChange(variant.id, selected)}
                  excludeIds={usedTypeIds.filter((id) => id !== variant.typeId)}
                />
              </div>
              <div className="w-full min-w-[200px]">
                {renderVariantValue(variant, currentSelector)}
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
                      <TableHead>Full Product Name</TableHead>
                      <TableHead>SKU Variant</TableHead>
                      <TableHead className="w-[200px]">Unique Code</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantData.map(
                      ({ originalSkuKey, skuKey, productName, uniqueCode }: VariantTableData) => (
                        <TableRow key={skuKey}>
                          <TableCell>{productName}</TableCell>
                          <TableCell colSpan={2}>
                            {renderSkuFields(originalSkuKey, skuKey, uniqueCode)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={skuStatuses[originalSkuKey] ?? true}
                              onCheckedChange={(checked) => handleStatusToggle(originalSkuKey, checked)}
                              className="mx-auto"
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