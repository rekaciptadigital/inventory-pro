"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  updateProductByVariant, 
  updateForm,
  selectProductNames,
  selectSkuInfo,
  selectVariantSelectors,
  addVariantSelector,
  removeVariantSelector,
  updateVariantSelectorValues,
  setVariants 
} from "@/lib/store/slices/formInventoryProductSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import type { SelectOption } from "@/components/ui/enhanced-select";
import { VariantSelector } from "@/components/inventory/variant-form/variant-selector";
import { useVariants } from "@/lib/hooks/use-variants";
import type { SelectedVariant } from "@/types/variant";

// Types - Remove the local SelectedVariant interface and use the imported one
interface CurrentSelector {
  id: number;
  name: string;
  values: string[];
  selected_values: string[];
}

// Utility functions for variant combinations
const generateCombinations = (variants: SelectedVariant[], variantTypes: any[]) => {
  if (!variants || variants.length === 0) return [[]];

  // Filter out variants with no values
  const validVariants = variants.filter(v => v.typeId && v.values && v.values.length > 0);
  
  if (validVariants.length === 0) return [[]];

  const sortedVariants = [...validVariants].sort((a, b) => {
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

export function VariantCombinations() {
  const dispatch = useDispatch();
  const variants = useSelector((state: RootState) => state.formInventoryProduct.product_by_variant);
  const mainSku = useSelector((state: RootState) => state.formInventoryProduct.sku);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  
  // Add variant selection state
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const { variants: variantTypes, findVariantById } = useVariants();
  const variantSelectors = useSelector(selectVariantSelectors);
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);
  const existingVariants = useSelector((state: RootState) => state.formInventoryProduct.variants);
  const [isInitialized, setIsInitialized] = useState(false);
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<Record<string, string>>({});
  const [skuStatuses, setSkuStatuses] = useState<Record<string, boolean>>({});
  const [vendorSkus, setVendorSkus] = useState<Record<string, string>>({});
  
  // Flag to control data flow direction
  const [isUpdatingFromVariantConfig, setIsUpdatingFromVariantConfig] = useState(false);
  
  // Generate unique ID for new variants
  const generateVariantId = useCallback(() => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).slice(2);
    return `variant-${timestamp}-${randomString}`;
  }, []);

  // Track which type IDs are already used
  const usedTypeIds = useMemo(
    () => selectedVariants.map((variant) => variant.typeId).filter(Boolean),
    [selectedVariants]
  );

  // Add new variant
  const handleAddVariant = useCallback(() => {
    setSelectedVariants((prev) => [
      ...prev,
      { id: generateVariantId(), typeId: 0, values: [] },
    ]);
  }, [generateVariantId]);

  // Remove variant
  const handleRemoveVariant = useCallback(
    (variantId: string) => {
      setSelectedVariants((prev) => {
        const newVariants = prev.filter((v) => v.id !== variantId);

        if (newVariants.length === 0) {
          // Reset everything when all variants are removed
          setVariantUniqueCodes({});
          setLocalValues({});
          setVendorSkus({});
          setSkuStatuses({});

          dispatch(
            updateForm({
              variants: [],
              variant_selectors: [],
              product_by_variant: [],
            })
          );
        } else {
          const variantToRemove = prev.find((v) => v.id === variantId);
          if (variantToRemove?.typeId) {
            dispatch(removeVariantSelector(variantToRemove.typeId));
          }
          
          // Force regeneration of variant combinations
          setIsUpdatingFromVariantConfig(true);
        }

        return newVariants;
      });
    },
    [dispatch]
  );

  // Handle variant type change
  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      const selectedTypeId = parseInt(selected.value);
      const selectedVariantType = findVariantById(selectedTypeId);

      if (!selectedVariantType) return;

      // Batch state updates together
      const updates = () => {
        // Mark that we're updating from variant config
        setIsUpdatingFromVariantConfig(true);

        setSelectedVariants((prev) => {
          const newVariants = prev.map((v) =>
            v.id === variantId
              ? {
                  ...v,
                  typeId: selectedTypeId,
                  values: [],  // Reset values when type changes
                  display_order: selectedVariantType.display_order,
                }
              : v
          );
          return newVariants;
        });

        // Only dispatch if we have a new variant type
        const existingSelector = variantSelectors?.find(
          (selector) => selector.id === selectedTypeId
        );

        if (!existingSelector) {
          dispatch(
            addVariantSelector({
              id: selectedTypeId,
              name: selectedVariantType.name,
              values: selectedVariantType.values.map(String),
              selected_values: []  // Reset selected values
            })
          );
        }
      };

      // Execute updates in next tick to avoid React batching issues
      Promise.resolve().then(updates);
    },
    [dispatch, variantSelectors, findVariantById]
  );

  // Handle variant values change
  const handleValuesChange = useCallback(
    (variantId: string, selected: SelectOption[]) => {
      const selectedValues = selected.map((option) => option.value);
      
      const variant = selectedVariants.find((v) => v.id === variantId);
      if (!variant?.typeId) return;
      
      // Mark that we're updating from variant config
      setIsUpdatingFromVariantConfig(true);
      
      // Update selected variants in component state
      setSelectedVariants((prev) => 
        prev.map((v) =>
          v.id === variantId
            ? { ...v, values: selectedValues }
            : v
        )
      );

      // Dispatch Redux action
      dispatch(
        updateVariantSelectorValues({
          id: variant.typeId,
          selected_values: selectedValues,
        })
      );
    },
    [dispatch, selectedVariants]
  );

  // Effect for updating variants in Redux when selected variants change
  useEffect(() => {
    if (!selectedVariants.length) return;
    
    const timer = setTimeout(() => {
      // Format and update variants in Redux
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

      // Single dispatch for all variants
      dispatch(updateForm({ variants: formattedVariants }));
      
      // Generate new variant combinations
      if (isUpdatingFromVariantConfig) {
        generateAndUpdateVariantCombinations();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [selectedVariants, variantTypes, dispatch]);

  // Check if we can generate variant SKUs
  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      (v) => v.typeId && v.values && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  // Generate variant combinations and update Redux
  const generateAndUpdateVariantCombinations = useCallback(() => {
    if (!canShowGeneratedSkus) {
      // Clear variants if we can't show them
      if (variants && variants.length > 0) {
        dispatch(updateProductByVariant([]));
      }
      return;
    }
    
    const combinations = generateCombinations(selectedVariants, variantTypes);
    
    // Map combinations to variant objects
    const variantsList = combinations.map((combo, index) => {
      // Change here: use numeric format like the old script
      const defaultUniqueCode = String(index + 1).padStart(4, "0"); // Now produces "0001", "0002", etc.
      const originalKey = `variant-${index}`;
      const storedUniqueCode = variantUniqueCodes[originalKey] || defaultUniqueCode;
      
      // Construct product name with variant values
      const variantNameParts = combo.filter(Boolean);
      let productName = full_product_name;
      if (variantNameParts.length > 0) {
        productName = `${full_product_name} ${variantNameParts.join(" ")}`;
      }
      
      return {
        originalKey,
        sku: `${baseSku}-${storedUniqueCode}`,
        sku_product_unique_code: storedUniqueCode,
        full_product_name: productName,
        vendor_sku: vendorSkus[originalKey] || '',
        status: skuStatuses[originalKey] !== undefined ? skuStatuses[originalKey] : true,
      };
    });

    // Update Redux with new variants
    dispatch(updateProductByVariant(variantsList));
    setIsUpdatingFromVariantConfig(false);
  }, [
    canShowGeneratedSkus, 
    selectedVariants, 
    variantTypes, 
    baseSku, 
    full_product_name, 
    variantUniqueCodes,
    vendorSkus,
    skuStatuses,
    dispatch,
    variants
  ]);
  
  // Generate variants when input data changes
  useEffect(() => {
    if (isUpdatingFromVariantConfig) {
      generateAndUpdateVariantCombinations();
    }
  }, [
    isUpdatingFromVariantConfig, 
    generateAndUpdateVariantCombinations
  ]);

  // Initialize from existing variants
  useEffect(() => {
    if (!isInitialized && existingVariants?.length > 0 && variantTypes?.length > 0) {
      try {
        setIsInitialized(true);

        // Initialize selected variants
        const initialVariants = existingVariants.map((variant) => {
          const variantType = variantTypes.find(vt => vt.id === variant.variant_id);
          return {
            id: `variant-${variant.variant_id}`,
            typeId: variant.variant_id,
            values: variant.variant_values.map((v) => v.variant_value_name),
            availableValues: variantType?.values || [],
            display_order: variantType?.display_order ?? 0,
          };
        });

        initialVariants.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        // Initialize variant selectors
        const initialSelectors = existingVariants.map((variant) => {
          const variantType = variantTypes.find(vt => vt.id === variant.variant_id);
          return {
            id: variant.variant_id,
            name: variantType?.name ?? variant.variant_name,
            values: variantType?.values.map(String) || [],
            selected_values: variant.variant_values.map((v) => v.variant_value_name),
          };
        });

        // Initialize from existing product_by_variant
        if (variants?.length > 0) {
          const codes: Record<string, string> = {};
          const statuses: Record<string, boolean> = {};
          const vendorValues: Record<string, string> = {};
          const localValuesDraft: Record<string, string> = {};
          
          variants.forEach((variant, index) => {
            const key = `variant-${index}`;
            codes[key] = variant.sku_product_unique_code || '';
            statuses[key] = variant.status ?? true;
            
            if (variant.vendor_sku) {
              vendorValues[key] = variant.vendor_sku;
              localValuesDraft[`vendor-${index}`] = variant.vendor_sku;
            }
          });
          
          setVariantUniqueCodes(codes);
          setSkuStatuses(statuses);
          setVendorSkus(vendorValues);
          setLocalValues(localValuesDraft);
        }

        // Update state
        setSelectedVariants(initialVariants);
        dispatch(updateForm({
          variants: existingVariants,
          variant_selectors: initialSelectors,
        }));

      } catch (error) {
        console.error('Error initializing variants:', error);
        setIsInitialized(false);
      }
    }
  }, [existingVariants, variantTypes, isInitialized, dispatch, variants]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsInitialized(false);
    };
  }, []);

  // Handler to update status of a variant
  const handleStatusToggle = (index: number, checked: boolean) => {
    if (!variants || !variants[index]) return;
    
    // Update local state first
    const key = `variant-${index}`;
    setSkuStatuses(prev => ({
      ...prev,
      [key]: checked
    }));
    
    // Then update Redux
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      status: checked
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };
  
  // Handler to update unique code
  const handleUniqueCodeChange = (index: number, code: string) => {
    if (!variants || !variants[index]) return;
    
    // Update local state first
    const key = `variant-${index}`;
    setVariantUniqueCodes(prev => ({
      ...prev,
      [key]: code
    }));
    
    // Then update Redux
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      sku_product_unique_code: code,
      sku: `${mainSku}-${code}`
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };

  // Handler to update vendor SKU
  const handleVendorSkuChange = (index: number, value: string) => {
    if (!variants || !variants[index]) return;
    
    // Store in local state
    const key = `vendor-${index}`;
    setLocalValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update redux when focus leaves the vendor SKU field
  const handleVendorSkuBlur = (index: number) => {
    if (!variants || !variants[index]) return;
    
    const key = `vendor-${index}`;
    const value = localValues[key] || '';
    
    // Update both local tracking state and Redux
    const variantKey = `variant-${index}`;
    setVendorSkus(prev => ({
      ...prev,
      [variantKey]: value
    }));
    
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      vendor_sku: value
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };
  
  // Generate default code
  const getDefaultCode = (index: number) => {
    return String(index + 1).padStart(4, "0"); // Returns "0001", "0002", etc.
  };
  
  // Reset unique code to default
  const handleResetUniqueCode = (index: number) => {
    const defaultCode = getDefaultCode(index);
    handleUniqueCodeChange(index, defaultCode);
  };

  // Check if we can display variants section
  const canShowVariantSection = variantTypes && variantTypes.length > 0;

  // If there are no variant types available, show a placeholder
  if (!canShowVariantSection) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No variant types available. Please add variant types first.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Variant Type/Value Selection Section */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Configure Variants</h3>
        
        {selectedVariants.map((variant) => {
          const variantType = variantTypes?.find(
            (vt) => vt.id === variant.typeId
          );

          const availableValues = variantType?.values || [];

          return (
            <VariantSelector
              key={variant.id}
              id={variant.id}
              typeId={variant.typeId}
              values={variant.values || []}
              usedTypeIds={usedTypeIds}
              variantTypeName={variantType?.name}
              availableValues={availableValues}
              onTypeChange={handleTypeChange}
              onValuesChange={handleValuesChange}
              onRemove={handleRemoveVariant}
            />
          );
        })}

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddVariant}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {/* Show explanation message when variants can't be generated yet */}
      {!canShowGeneratedSkus && variantSelectors.length > 0 && (
        <div className="text-sm text-muted-foreground border rounded p-4 bg-muted/20">
          <p className="font-medium">Please complete the following to generate SKUs:</p>
          <ul className="list-disc list-inside mt-2">
            {!full_product_name && <li>Product name is required in the Basic Information section</li>}
            {!baseSku && <li>Base SKU is required in the Basic Information section</li>}
            {!selectedVariants.some(v => v.typeId && v.values && v.values.length > 0) && (
              <li>At least one variant with selected values is required</li>
            )}
          </ul>
        </div>
      )}

      {/* Only show Variant SKUs section when data can be generated */}
      {canShowGeneratedSkus && (
        <>
          <h3 className="text-md font-medium">Variant SKUs</h3>
          
          {!variants || variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No variants configured. Add variants above and fill in the basic product information first.
            </div>
          ) : (
            <div className="overflow-auto">
              <div className="rounded-md border min-w-[640px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Product Name</TableHead>
                      <TableHead>SKU Variant</TableHead>
                      <TableHead className="w-[200px]">Unique Code</TableHead>
                      <TableHead>Vendor SKU</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant, index) => (
                      <TableRow key={index}>
                        <TableCell>{variant.full_product_name}</TableCell>
                        <TableCell>
                          <FormItem className="space-y-2 mb-0">
                            <FormControl>
                              <Input
                                value={`${mainSku}-${variant.sku_product_unique_code}`}
                                className="font-mono bg-muted"
                                readOnly
                              />
                            </FormControl>
                            <FormDescription>
                              Generated SKU based on main SKU and unique code
                            </FormDescription>
                          </FormItem>
                        </TableCell>
                        <TableCell>
                          <FormItem className="space-y-2 mb-0">
                            <FormControl>
                              <div className="relative">
                                <Input
                                  value={variant.sku_product_unique_code}
                                  onChange={(e) => handleUniqueCodeChange(index, e.target.value)}
                                  className="font-mono pr-8"
                                  placeholder="0000"
                                  maxLength={10}
                                  // Add these attributes to match old behavior
                                  type="text"
                                  inputMode="numeric"
                                  pattern="\d*"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                  onClick={() => handleResetUniqueCode(index)}
                                  title={`Reset to default (${getDefaultCode(index)})`}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter 1-10 numeric or use the default code
                            </FormDescription>
                          </FormItem>
                        </TableCell>
                        <TableCell>
                          <FormItem className="space-y-2 mb-0">
                            <FormControl>
                              <Input
                                value={localValues[`vendor-${index}`] || variant.vendor_sku || ''}
                                onChange={(e) => handleVendorSkuChange(index, e.target.value)}
                                onBlur={() => handleVendorSkuBlur(index)}
                                placeholder="(Optional)"
                                maxLength={50}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional vendor reference number
                            </FormDescription>
                          </FormItem>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Switch
                              checked={variant.status ?? true}
                              onCheckedChange={(checked) => handleStatusToggle(index, checked)}
                              className="mx-auto"
                            />
                            <span className="text-xs mt-1 text-muted-foreground">
                              {(variant.status ?? true) ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}