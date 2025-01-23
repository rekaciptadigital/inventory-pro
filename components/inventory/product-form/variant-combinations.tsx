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

/**
 * Interface untuk struktur data varian yang dipilih
 * typeId: ID numerik untuk tipe varian
 * values: Array string berisi nilai-nilai yang dipilih untuk tipe varian tersebut
 */
interface SelectedVariant {
  id: string; // Add unique identifier
  typeId: number; // Make sure this is number
  values: string[]; // Already an array, but now will contain multiple values
  availableValues?: string[]; // Add this to store available values from selected variant
}

/**
 * Komponen VariantCombinations
 *
 * Komponen ini menangani pembuatan dan pengelolaan kombinasi varian produk.
 * Memungkinkan pengguna untuk:
 * - Menambah/menghapus tipe varian
 * - Memilih nilai-nilai untuk setiap tipe varian
 * - Menghasilkan SKU otomatis berdasarkan kombinasi varian
 */
export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(
    []
  );
  const { variantTypes } = useVariantTypes(); // Add this hook
  const variantSelectors = useSelector(selectVariantSelectors);

  // Add new state to track pending Redux updates
  const [pendingReduxUpdate, setPendingReduxUpdate] = useState<{
    type: "variants" | "selector";
    data: any;
  } | null>(null);

  // Add state to track pending updates
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

  /**
   * Hooks untuk mengambil data brands dan product types
   * Data ini digunakan untuk menampilkan nama brand dan tipe produk
   * dalam generated SKU
   */
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();

  /**
   * Memantau perubahan nilai form menggunakan watch
   * Nilai-nilai ini digunakan untuk membuat SKU dan mengatur harga dasar
   */
  // Watch form values
  const brand = form.watch("brand");
  const productTypeId = form.watch("productTypeId");
  const sku = form.watch("sku");
  const productName = form.watch("productName");

  // Get brand and product type names
  const brandName = brands?.find((b) => b.id === brand)?.name || "";
  const productTypeName =
    productTypes?.find((pt) => pt.id === productTypeId)?.name || "";

  // Product details for SKU generation
  const productDetails = {
    brand: brandName,
    productType: productTypeName,
    productName,
  };

  // Replace the generateVariantId function with a more stable version
  const generateVariantId = useCallback((index: number) => {
    return `variant-${index}`;
  }, []);

  // Add clientside initialization flag
  const [isClient, setIsClient] = useState(false);

  // Add effect to mark client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Fungsi untuk menambah baris varian baru
   * Menginisialisasi dengan typeId 0 dan array values kosong
   */
  const handleAddVariant = useCallback(() => {
    const newIndex = selectedVariants.length;
    const uniqueId = generateVariantId(newIndex);

    setSelectedVariants((prev) => [
      ...prev,
      { id: uniqueId, typeId: 0, values: [] },
    ]);

    // Update Redux store without touching the form
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

  /**
   * Fungsi untuk menghapus baris varian berdasarkan index
   * Memperbarui state dan nilai form setelah penghapusan
   */
  const handleRemoveVariant = useCallback((variantId: string) => {
    setPendingRemoval(variantId);
  }, []);

  /**
   * Fungsi untuk menangani perubahan tipe varian
   * Mereset nilai values menjadi array kosong saat tipe berubah
   */
  const handleTypeChange = useCallback(
    (variantId: string, selected: SelectOption | null) => {
      if (!selected?.data) return;

      // Reset the values when type changes
      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
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

      // Set pending update instead of dispatching directly
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

  /**
   * Fungsi untuk memperbarui nilai-nilai varian yang dipilih
   * Memperbarui state dan nilai form ketika nilai dipilih
   */
  const handleValuesChange = useCallback(
    (variantId: string, selected: SelectOption[]) => {
      const variant = selectedVariants.find((v) => v.id === variantId);
      if (!variant) return;

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                values: selected.map((option) => option.value), // Handle multiple values
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

  // Add useEffect to handle Redux updates
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

  // Effect untuk inisialisasi data variant dari Redux jika ada
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

  // Effect to handle type updates
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

  // Effect to handle values updates
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

  // Effect to handle variant removal
  useEffect(() => {
    if (pendingRemoval === null) return;

    const variant = selectedVariants.find((v) => v.id === pendingRemoval);
    if (variant?.typeId) {
      dispatch(removeVariantSelector(variant.typeId));
    }

    const newVariants = selectedVariants.filter((v) => v.id !== pendingRemoval);

    // Format variants for Redux update
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

    // Update form value
    form.setValue("variants", formattedVariants, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setPendingRemoval(null);
  }, [pendingRemoval, selectedVariants, dispatch, form, variantTypes]);

  /**
   * Menyimpan daftar typeId yang sudah digunakan
   * Digunakan untuk mencegah pemilihan tipe varian yang sama
   */
  const usedTypeIds = selectedVariants.map((v) => v.typeId).filter(Boolean);

  const handleVariantChange = useCallback(
    (selectedVariants: Variant[]) => {
      // Transform the variants into the required format
      const formattedVariants = selectedVariants.map((variant) => ({
        variant_id: variant.id,
        variant_name: variant.name,
        variant_values: variant.selectedValues.map((value) => ({
          variant_value_id: value.id,
          variant_value_name: value.name,
        })),
      }));

      // Update Redux store
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
      // Update the specific variant's values
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

  // Get values from Redux store
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);

  // Generate combinations function
  const generateCombinations = (variants: SelectedVariant[]) => {
    if (variants.length === 0) return [[]];

    const [first, ...rest] = variants;
    const restCombinations = generateCombinations(rest);

    return first.values.flatMap((value) =>
      restCombinations.map((combo) => [value, ...combo])
    );
  };

  // Format variant combination for display - remove separator
  const formatVariantCombo = (combo: string[]) => {
    return combo.join(" "); // Remove separator, just use space
  };

  // Tambahkan state untuk menyimpan unique codes
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<
    Record<string, string>
  >({});

  // Generate sequential unique code
  const generateUniqueCode = useCallback((index: number) => {
    return String(index + 1).padStart(4, "0"); // Will generate: 0001, 0002, etc.
  }, []);

  // Add validation check for Generated SKUs visibility
  const canShowGeneratedSkus = useMemo(() => {
    const hasValidVariants = selectedVariants.some(
      (v) => v.typeId && v.values.length > 0
    );
    return Boolean(full_product_name && baseSku && hasValidVariants);
  }, [full_product_name, baseSku, selectedVariants]);

  // Add selector for product_by_variant
  const productByVariant = useSelector(
    (state: RootState) => state.formInventoryProduct.product_by_variant
  );

  // Modify variantData to track unique codes independently
  const variantData = useMemo(() => {
    if (!canShowGeneratedSkus) return [];

    const filteredVariants = selectedVariants.filter(
      (v) => v.values.length > 0
    );
    const combinations = generateCombinations(filteredVariants);

    return combinations.map((combo, index) => {
      const variantCombo = formatVariantCombo(combo);
      // Use original skuKey for lookup
      const originalSkuKey = `${baseSku}-${index + 1}`;

      // Find existing variant data from Redux
      const existingVariant = productByVariant?.find(
        (v) => v.originalSkuKey === originalSkuKey
      );
      const uniqueCode =
        existingVariant?.unique_code || generateUniqueCode(index);

      return {
        originalSkuKey, // Keep original key for lookup
        skuKey: `${baseSku}-${uniqueCode}`, // Display SKU
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

  // Modify handleUniqueCodeChange to handle input better
  const handleUniqueCodeChange = useCallback(
    (originalSkuKey: string, value: string) => {
      const cleanValue = value.replace(/\D/g, "").slice(0, 4);

      // Update local state immediately
      setVariantUniqueCodes((prev) => ({
        ...prev,
        [originalSkuKey]: cleanValue,
      }));

      // Prepare the updated variants data
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

      // Debounce Redux update
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

  // Add state to track the currently focused input
  const [focusedSkuKey, setFocusedSkuKey] = useState<string | null>(null);

  // Modify the return statement to handle client-side rendering
  if (!isClient) {
    return null; // or a loading state
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
                              className="w-[120px] font-mono" // Removed text-center class
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
